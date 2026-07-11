import { BookingStatus, PaymentStatus, Prisma, Role } from "@prisma/client";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { config } from "../../config";
import { ApiError } from "../../core/ApiError";
import { prisma } from "../../lib/prisma";
import { getStripe } from "../../lib/stripe";

type Provider = "STRIPE" | "SSLCOMMERZ";

type SslInitiationResponse = {
  status?: string;
  failedreason?: string;
  GatewayPageURL?: string;
  sessionkey?: string;
  [key: string]: unknown;
};

type SslValidationResponse = {
  status?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  currency?: string;
  card_type?: string;
  risk_level?: string | number;
  [key: string]: unknown;
};

const paymentInclude = {
  booking: {
    include: {
      service: { include: { category: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true } } } }
    }
  }
} satisfies Prisma.PaymentInclude;

const makeTransactionId = () => `FIN-${Date.now()}-${randomUUID().slice(0, 8)}`;

const requireSslCommerz = () => {
  if (!config.sslCommerz.storeId || !config.sslCommerz.storePassword) {
    throw new ApiError(503, "SSLCOMMERZ is not configured on this server");
  }
};

const sslGatewayBase = () =>
  config.sslCommerz.isLive ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com";

const updatePayment = (id: string, data: Record<string, unknown>) =>
  prisma.payment.update({ where: { id }, data: data as never, include: paymentInclude });

const preparePayment = async (customerId: string, bookingId: string, provider: Provider) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, service: { include: { category: true } }, payment: true }
  });

  if (!booking || booking.customerId !== customerId) throw new ApiError(404, "Booking not found");
  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new ApiError(400, "Payment can be created only after the technician accepts the booking");
  }
  if (booking.payment?.status === PaymentStatus.COMPLETED) throw new ApiError(409, "This booking is already paid");

  const currency = provider === "STRIPE" ? config.stripe.currency : config.sslCommerz.currency;
  const transactionId = makeTransactionId();
  const payment = await prisma.payment.upsert({
    where: { bookingId },
    update: {
      transactionId,
      provider,
      amount: booking.totalAmount,
      currency,
      status: PaymentStatus.PENDING,
      checkoutUrl: null,
      stripeSessionId: null,
      sslSessionKey: null,
      gatewayResponse: Prisma.JsonNull,
      method: null
    } as never,
    create: {
      bookingId,
      userId: customerId,
      transactionId,
      provider,
      amount: booking.totalAmount,
      currency,
      status: PaymentStatus.PENDING
    } as never,
    include: paymentInclude
  });

  return { booking, payment };
};

const createStripeCheckout = async (customerId: string, bookingId: string) => {
  const { booking, payment } = await preparePayment(customerId, bookingId, "STRIPE");
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.customer.email,
    client_reference_id: booking.id,
    line_items: [
      {
        price_data: {
          currency: config.stripe.currency,
          product_data: {
            name: booking.service.title,
            description: booking.service.category.name
          },
          unit_amount: Math.round(Number(booking.totalAmount) * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${config.stripe.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.stripe.cancelUrl}?bookingId=${booking.id}`,
    metadata: {
      paymentId: payment.id,
      bookingId: booking.id,
      customerId
    }
  });

  const saved = await updatePayment(payment.id, {
    stripeSessionId: session.id,
    checkoutUrl: session.url,
    method: "CARD",
    gatewayResponse: { id: session.id, status: session.status }
  });

  return { payment: saved, checkoutUrl: session.url };
};

const createSslCommerzCheckout = async (customerId: string, bookingId: string) => {
  requireSslCommerz();
  const { booking, payment } = await preparePayment(customerId, bookingId, "SSLCOMMERZ");

  const request = new URLSearchParams({
    store_id: config.sslCommerz.storeId,
    store_passwd: config.sslCommerz.storePassword,
    total_amount: Number(booking.totalAmount).toFixed(2),
    currency: config.sslCommerz.currency,
    tran_id: payment.transactionId,
    success_url: config.sslCommerz.successUrl,
    fail_url: config.sslCommerz.failUrl,
    cancel_url: config.sslCommerz.cancelUrl,
    ipn_url: config.sslCommerz.ipnUrl,
    shipping_method: "NO",
    product_name: booking.service.title,
    product_category: booking.service.category.name,
    product_profile: "general",
    cus_name: booking.customer.name,
    cus_email: booking.customer.email,
    cus_add1: booking.address,
    cus_city: booking.customer.location ?? "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: booking.customer.phone ?? "N/A"
  });

  const response = await fetch(`${sslGatewayBase()}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: request
  });
  const gateway = (await response.json()) as SslInitiationResponse;

  if (!response.ok || gateway.status !== "SUCCESS" || !gateway.GatewayPageURL) {
    await updatePayment(payment.id, { status: PaymentStatus.FAILED, gatewayResponse: gateway });
    throw new ApiError(502, gateway.failedreason ?? "SSLCOMMERZ could not create a payment session");
  }

  const saved = await updatePayment(payment.id, {
    checkoutUrl: gateway.GatewayPageURL,
    sslSessionKey: gateway.sessionkey,
    gatewayResponse: gateway
  });

  return { payment: saved, checkoutUrl: gateway.GatewayPageURL };
};

const create = (customerId: string, bookingId: string, provider: Provider) =>
  provider === "STRIPE"
    ? createStripeCheckout(customerId, bookingId)
    : createSslCommerzCheckout(customerId, bookingId);

const finalize = async (paymentId: string, providerTransactionId: string, gatewayResponse: unknown, method?: string) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId }, include: { booking: true } });
    if (!payment) throw new ApiError(404, "Payment record not found");
    if (payment.status === PaymentStatus.COMPLETED) return payment;
    if (payment.booking.status !== BookingStatus.ACCEPTED && payment.booking.status !== BookingStatus.PAID) {
      throw new ApiError(409, `Payment cannot complete a ${payment.booking.status} booking`);
    }

    const completed = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        transactionId: providerTransactionId,
        gatewayResponse,
        method
      } as never
    });

    if (payment.booking.status !== BookingStatus.PAID) {
      await tx.booking.update({ where: { id: payment.bookingId }, data: { status: BookingStatus.PAID } });
    }
    return completed;
  });
};

type PaymentActor = { userId: string; role: Role };

const assertPaymentOwner = async (paymentId: string, actor?: PaymentActor) => {
  if (!actor || actor.role === Role.ADMIN) return;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { userId: true } });
  if (!payment || payment.userId !== actor.userId) throw new ApiError(403, "You cannot confirm this payment");
};

const confirmStripeSession = async (sessionId: string, actor?: PaymentActor) => {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") throw new ApiError(400, "Stripe session has not been paid");
  const paymentId = session.metadata?.paymentId;
  if (!paymentId) throw new ApiError(400, "Stripe session metadata is incomplete");
  await assertPaymentOwner(paymentId, actor);

  const providerTransactionId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? session.id;
  return finalize(paymentId, providerTransactionId, session, "CARD");
};

const validateSslCommerz = async (validationId: string, actor?: PaymentActor) => {
  requireSslCommerz();
  const url = new URL(`${sslGatewayBase()}/validator/api/validationserverAPI.php`);
  url.searchParams.set("val_id", validationId);
  url.searchParams.set("store_id", config.sslCommerz.storeId);
  url.searchParams.set("store_passwd", config.sslCommerz.storePassword);
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  const validation = (await response.json()) as SslValidationResponse;
  if (!response.ok || !["VALID", "VALIDATED"].includes(validation.status ?? "")) {
    throw new ApiError(400, "SSLCOMMERZ validation failed", validation);
  }
  if (!validation.tran_id) throw new ApiError(400, "SSLCOMMERZ response is missing transaction ID");

  const payment = await prisma.payment.findUnique({ where: { transactionId: validation.tran_id } });
  if (!payment) throw new ApiError(404, "Payment transaction was not found");
  await assertPaymentOwner(payment.id, actor);
  if (Number(validation.amount) !== Number(payment.amount) || validation.currency?.toUpperCase() !== payment.currency.toUpperCase()) {
    throw new ApiError(400, "Payment amount or currency did not match the booking");
  }

  return finalize(payment.id, validation.tran_id, validation, validation.card_type);
};

const confirm = (
  userId: string,
  role: Role,
  provider: Provider,
  input: { sessionId?: string; validationId?: string }
) => {
  const actor = { userId, role };
  if (provider === "STRIPE") return confirmStripeSession(input.sessionId!, actor);
  return validateSslCommerz(input.validationId!, actor);
};

const handleStripeWebhook = async (payload: Buffer, signature: string | undefined) => {
  if (!config.stripe.webhookSecret) throw new ApiError(503, "Stripe webhook secret is not configured");
  if (!signature) throw new ApiError(400, "Missing Stripe signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
  } catch (error) {
    throw new ApiError(400, "Invalid Stripe webhook signature", error instanceof Error ? error.message : error);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid" && session.metadata?.paymentId) {
      const transactionId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? session.id;
      await finalize(session.metadata.paymentId, transactionId, session, "CARD");
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.paymentId) {
      await prisma.payment.updateMany({
        where: { id: session.metadata.paymentId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.CANCELLED }
      });
    }
  }
  return { received: true };
};

const handleSslSuccess = (body: Record<string, unknown>) => {
  const validationId = String(body.val_id ?? "");
  if (!validationId) throw new ApiError(400, "SSLCOMMERZ validation ID is missing");
  return validateSslCommerz(validationId);
};

const handleSslFailure = async (body: Record<string, unknown>, status: PaymentStatus) => {
  const transactionId = String(body.tran_id ?? "");
  if (!transactionId) throw new ApiError(400, "SSLCOMMERZ transaction ID is missing");
  await prisma.payment.updateMany({
    where: { transactionId, status: PaymentStatus.PENDING },
    data: { status, gatewayResponse: body } as never
  });
  return { transactionId, status };
};

const listForUser = (userId: string, role: Role) =>
  prisma.payment.findMany({
    where: role === Role.ADMIN ? {} : { userId },
    include: paymentInclude,
    orderBy: { createdAt: "desc" }
  });

const getById = async (userId: string, role: Role, id: string) => {
  const payment = await prisma.payment.findUnique({ where: { id }, include: paymentInclude });
  if (!payment) throw new ApiError(404, "Payment not found");
  if (role !== Role.ADMIN && payment.userId !== userId) throw new ApiError(403, "You cannot view this payment");
  return payment;
};

export const paymentService = {
  create,
  confirm,
  handleStripeWebhook,
  handleSslSuccess,
  handleSslFailure,
  listForUser,
  getById
};
