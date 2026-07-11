"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const client_1 = require("@prisma/client");
const node_crypto_1 = require("node:crypto");
const config_1 = require("../../config");
const ApiError_1 = require("../../core/ApiError");
const prisma_1 = require("../../lib/prisma");
const stripe_1 = require("../../lib/stripe");
const paymentInclude = {
    booking: {
        include: {
            service: { include: { category: true } },
            technician: { include: { user: { select: { id: true, name: true, email: true } } } }
        }
    }
};
const makeTransactionId = () => `FIN-${Date.now()}-${(0, node_crypto_1.randomUUID)().slice(0, 8)}`;
const requireSslCommerz = () => {
    if (!config_1.config.sslCommerz.storeId || !config_1.config.sslCommerz.storePassword) {
        throw new ApiError_1.ApiError(503, "SSLCOMMERZ is not configured on this server");
    }
};
const sslGatewayBase = () => config_1.config.sslCommerz.isLive ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com";
const updatePayment = (id, data) => prisma_1.prisma.payment.update({ where: { id }, data: data, include: paymentInclude });
const preparePayment = async (customerId, bookingId, provider) => {
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { customer: true, service: { include: { category: true } }, payment: true }
    });
    if (!booking || booking.customerId !== customerId)
        throw new ApiError_1.ApiError(404, "Booking not found");
    if (booking.status !== client_1.BookingStatus.ACCEPTED) {
        throw new ApiError_1.ApiError(400, "Payment can be created only after the technician accepts the booking");
    }
    if (booking.payment?.status === client_1.PaymentStatus.COMPLETED)
        throw new ApiError_1.ApiError(409, "This booking is already paid");
    const currency = provider === "STRIPE" ? config_1.config.stripe.currency : config_1.config.sslCommerz.currency;
    const transactionId = makeTransactionId();
    const payment = await prisma_1.prisma.payment.upsert({
        where: { bookingId },
        update: {
            transactionId,
            provider,
            amount: booking.totalAmount,
            currency,
            status: client_1.PaymentStatus.PENDING,
            checkoutUrl: null,
            stripeSessionId: null,
            sslSessionKey: null,
            gatewayResponse: client_1.Prisma.JsonNull,
            method: null
        },
        create: {
            bookingId,
            userId: customerId,
            transactionId,
            provider,
            amount: booking.totalAmount,
            currency,
            status: client_1.PaymentStatus.PENDING
        },
        include: paymentInclude
    });
    return { booking, payment };
};
const createStripeCheckout = async (customerId, bookingId) => {
    const { booking, payment } = await preparePayment(customerId, bookingId, "STRIPE");
    const stripe = (0, stripe_1.getStripe)();
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: booking.customer.email,
        client_reference_id: booking.id,
        line_items: [
            {
                price_data: {
                    currency: config_1.config.stripe.currency,
                    product_data: {
                        name: booking.service.title,
                        description: booking.service.category.name
                    },
                    unit_amount: Math.round(Number(booking.totalAmount) * 100)
                },
                quantity: 1
            }
        ],
        success_url: `${config_1.config.stripe.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config_1.config.stripe.cancelUrl}?bookingId=${booking.id}`,
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
const createSslCommerzCheckout = async (customerId, bookingId) => {
    requireSslCommerz();
    const { booking, payment } = await preparePayment(customerId, bookingId, "SSLCOMMERZ");
    const request = new URLSearchParams({
        store_id: config_1.config.sslCommerz.storeId,
        store_passwd: config_1.config.sslCommerz.storePassword,
        total_amount: Number(booking.totalAmount).toFixed(2),
        currency: config_1.config.sslCommerz.currency,
        tran_id: payment.transactionId,
        success_url: config_1.config.sslCommerz.successUrl,
        fail_url: config_1.config.sslCommerz.failUrl,
        cancel_url: config_1.config.sslCommerz.cancelUrl,
        ipn_url: config_1.config.sslCommerz.ipnUrl,
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
    const gateway = (await response.json());
    if (!response.ok || gateway.status !== "SUCCESS" || !gateway.GatewayPageURL) {
        await updatePayment(payment.id, { status: client_1.PaymentStatus.FAILED, gatewayResponse: gateway });
        throw new ApiError_1.ApiError(502, gateway.failedreason ?? "SSLCOMMERZ could not create a payment session");
    }
    const saved = await updatePayment(payment.id, {
        checkoutUrl: gateway.GatewayPageURL,
        sslSessionKey: gateway.sessionkey,
        gatewayResponse: gateway
    });
    return { payment: saved, checkoutUrl: gateway.GatewayPageURL };
};
const create = (customerId, bookingId, provider) => provider === "STRIPE"
    ? createStripeCheckout(customerId, bookingId)
    : createSslCommerzCheckout(customerId, bookingId);
const finalize = async (paymentId, providerTransactionId, gatewayResponse, method) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId }, include: { booking: true } });
        if (!payment)
            throw new ApiError_1.ApiError(404, "Payment record not found");
        if (payment.status === client_1.PaymentStatus.COMPLETED)
            return payment;
        if (payment.booking.status !== client_1.BookingStatus.ACCEPTED && payment.booking.status !== client_1.BookingStatus.PAID) {
            throw new ApiError_1.ApiError(409, `Payment cannot complete a ${payment.booking.status} booking`);
        }
        const completed = await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                paidAt: new Date(),
                transactionId: providerTransactionId,
                gatewayResponse,
                method
            }
        });
        if (payment.booking.status !== client_1.BookingStatus.PAID) {
            await tx.booking.update({ where: { id: payment.bookingId }, data: { status: client_1.BookingStatus.PAID } });
        }
        return completed;
    });
};
const assertPaymentOwner = async (paymentId, actor) => {
    if (!actor || actor.role === client_1.Role.ADMIN)
        return;
    const payment = await prisma_1.prisma.payment.findUnique({ where: { id: paymentId }, select: { userId: true } });
    if (!payment || payment.userId !== actor.userId)
        throw new ApiError_1.ApiError(403, "You cannot confirm this payment");
};
const confirmStripeSession = async (sessionId, actor) => {
    const session = await (0, stripe_1.getStripe)().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid")
        throw new ApiError_1.ApiError(400, "Stripe session has not been paid");
    const paymentId = session.metadata?.paymentId;
    if (!paymentId)
        throw new ApiError_1.ApiError(400, "Stripe session metadata is incomplete");
    await assertPaymentOwner(paymentId, actor);
    const providerTransactionId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? session.id;
    return finalize(paymentId, providerTransactionId, session, "CARD");
};
const validateSslCommerz = async (validationId, actor) => {
    requireSslCommerz();
    const url = new URL(`${sslGatewayBase()}/validator/api/validationserverAPI.php`);
    url.searchParams.set("val_id", validationId);
    url.searchParams.set("store_id", config_1.config.sslCommerz.storeId);
    url.searchParams.set("store_passwd", config_1.config.sslCommerz.storePassword);
    url.searchParams.set("format", "json");
    const response = await fetch(url);
    const validation = (await response.json());
    if (!response.ok || !["VALID", "VALIDATED"].includes(validation.status ?? "")) {
        throw new ApiError_1.ApiError(400, "SSLCOMMERZ validation failed", validation);
    }
    if (!validation.tran_id)
        throw new ApiError_1.ApiError(400, "SSLCOMMERZ response is missing transaction ID");
    const payment = await prisma_1.prisma.payment.findUnique({ where: { transactionId: validation.tran_id } });
    if (!payment)
        throw new ApiError_1.ApiError(404, "Payment transaction was not found");
    await assertPaymentOwner(payment.id, actor);
    if (Number(validation.amount) !== Number(payment.amount) || validation.currency?.toUpperCase() !== payment.currency.toUpperCase()) {
        throw new ApiError_1.ApiError(400, "Payment amount or currency did not match the booking");
    }
    return finalize(payment.id, validation.tran_id, validation, validation.card_type);
};
const confirm = (userId, role, provider, input) => {
    const actor = { userId, role };
    if (provider === "STRIPE")
        return confirmStripeSession(input.sessionId, actor);
    return validateSslCommerz(input.validationId, actor);
};
const handleStripeWebhook = async (payload, signature) => {
    if (!config_1.config.stripe.webhookSecret)
        throw new ApiError_1.ApiError(503, "Stripe webhook secret is not configured");
    if (!signature)
        throw new ApiError_1.ApiError(400, "Missing Stripe signature");
    let event;
    try {
        event = (0, stripe_1.getStripe)().webhooks.constructEvent(payload, signature, config_1.config.stripe.webhookSecret);
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, "Invalid Stripe webhook signature", error instanceof Error ? error.message : error);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        if (session.payment_status === "paid" && session.metadata?.paymentId) {
            const transactionId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? session.id;
            await finalize(session.metadata.paymentId, transactionId, session, "CARD");
        }
    }
    else if (event.type === "checkout.session.expired") {
        const session = event.data.object;
        if (session.metadata?.paymentId) {
            await prisma_1.prisma.payment.updateMany({
                where: { id: session.metadata.paymentId, status: client_1.PaymentStatus.PENDING },
                data: { status: client_1.PaymentStatus.CANCELLED }
            });
        }
    }
    return { received: true };
};
const handleSslSuccess = (body) => {
    const validationId = String(body.val_id ?? "");
    if (!validationId)
        throw new ApiError_1.ApiError(400, "SSLCOMMERZ validation ID is missing");
    return validateSslCommerz(validationId);
};
const handleSslFailure = async (body, status) => {
    const transactionId = String(body.tran_id ?? "");
    if (!transactionId)
        throw new ApiError_1.ApiError(400, "SSLCOMMERZ transaction ID is missing");
    await prisma_1.prisma.payment.updateMany({
        where: { transactionId, status: client_1.PaymentStatus.PENDING },
        data: { status, gatewayResponse: body }
    });
    return { transactionId, status };
};
const listForUser = (userId, role) => prisma_1.prisma.payment.findMany({
    where: role === client_1.Role.ADMIN ? {} : { userId },
    include: paymentInclude,
    orderBy: { createdAt: "desc" }
});
const getById = async (userId, role, id) => {
    const payment = await prisma_1.prisma.payment.findUnique({ where: { id }, include: paymentInclude });
    if (!payment)
        throw new ApiError_1.ApiError(404, "Payment not found");
    if (role !== client_1.Role.ADMIN && payment.userId !== userId)
        throw new ApiError_1.ApiError(403, "You cannot view this payment");
    return payment;
};
exports.paymentService = {
    create,
    confirm,
    handleStripeWebhook,
    handleSslSuccess,
    handleSslFailure,
    listForUser,
    getById
};
//# sourceMappingURL=payment.service.js.map