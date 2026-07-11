import Stripe from "stripe";
import { Role, BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const paymentInclude = {
  booking: {
    include: {
      service: true,
      technician: { include: { user: { select: { id: true, name: true, email: true } } } }
    }
  }
};

const createCheckoutSession = async (customerId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, customer: true, payment: true }
  });

  if (!booking || booking.customerId !== customerId) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new AppError(400, "Payment is allowed only after the booking is accepted");
  }

  if (booking.payment?.status === PaymentStatus.COMPLETED) {
    throw new AppError(400, "This booking is already paid");
  }

  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: { status: PaymentStatus.PENDING, amount: booking.totalAmount },
    create: {
      bookingId: booking.id,
      userId: customerId,
      amount: booking.totalAmount,
      transactionId: `TXN-${Date.now()}-${booking.id.slice(0, 6)}`
    }
  });

  const amountInCents = Math.round(Number(booking.totalAmount) * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: booking.customer.email,
    client_reference_id: booking.id,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: booking.service.title },
          unit_amount: amountInCents
        },
        quantity: 1
      }
    ],
    success_url: `${config.stripeSuccessUrl}?bookingId=${booking.id}`,
    cancel_url: `${config.stripeCancelUrl}?bookingId=${booking.id}`,
    metadata: {
      bookingId: booking.id,
      paymentId: payment.id,
      customerId
    }
  });

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      stripeSessionId: session.id,
      checkoutUrl: session.url || undefined
    }
  });

  return { payment: updatedPayment, checkoutUrl: session.url };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  if (!config.stripeWebhookSecret) {
    throw new AppError(500, "Stripe webhook secret is missing");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, config.stripeWebhookSecret);
  } catch (error) {
    throw new AppError(400, "Invalid Stripe webhook signature", error instanceof Error ? error.message : error);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.paymentId;
    const bookingId = session.metadata?.bookingId;

    if (paymentId && bookingId) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            stripeSessionId: session.id,
            transactionId: session.payment_intent?.toString() || `STRIPE-${session.id}`
          }
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.PAID }
        });
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.paymentId;

    if (paymentId) {
      await prisma.payment.update({ where: { id: paymentId }, data: { status: PaymentStatus.CANCELLED } });
    }
  }

  return { received: true };
};

const getMyPayments = async (userId: string, role: Role) => {
  const where = role === Role.ADMIN ? {} : { userId };
  return prisma.payment.findMany({ where, include: paymentInclude, orderBy: { createdAt: "desc" } });
};

const getById = async (userId: string, role: Role, id: string) => {
  const payment = await prisma.payment.findUnique({ where: { id }, include: paymentInclude });
  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  if (role !== Role.ADMIN && payment.userId !== userId) {
    throw new AppError(403, "You do not have permission to view this payment");
  }

  return payment;
};

export const paymentService = {
  createCheckoutSession,
  handleWebhook,
  getMyPayments,
  getById
};
