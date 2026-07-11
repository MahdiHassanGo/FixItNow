"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const client_1 = require("@prisma/client");
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const payment_service_1 = require("./payment.service");
const create = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const result = await payment_service_1.paymentService.create(req.user.id, req.body.bookingId, req.body.provider);
    (0, respond_1.respond)(res, { statusCode: 201, message: "Payment session created", data: result });
});
const confirm = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const payment = await payment_service_1.paymentService.confirm(req.user.id, req.user.role, req.body.provider, req.body);
    (0, respond_1.respond)(res, { message: "Payment confirmed", data: payment });
});
const stripeWebhook = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const result = await payment_service_1.paymentService.handleStripeWebhook(req.body, req.headers["stripe-signature"]);
    (0, respond_1.respond)(res, { message: "Stripe webhook processed", data: result });
});
const sslSuccess = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const payment = await payment_service_1.paymentService.handleSslSuccess(req.body);
    (0, respond_1.respond)(res, { message: "SSLCOMMERZ payment confirmed", data: payment });
});
const sslIpn = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const payment = await payment_service_1.paymentService.handleSslSuccess(req.body);
    (0, respond_1.respond)(res, { message: "SSLCOMMERZ IPN processed", data: payment });
});
const sslFail = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const result = await payment_service_1.paymentService.handleSslFailure(req.body, client_1.PaymentStatus.FAILED);
    (0, respond_1.respond)(res, { message: "SSLCOMMERZ payment failed", data: result });
});
const sslCancel = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const result = await payment_service_1.paymentService.handleSslFailure(req.body, client_1.PaymentStatus.CANCELLED);
    (0, respond_1.respond)(res, { message: "SSLCOMMERZ payment cancelled", data: result });
});
const list = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Payments retrieved", data: await payment_service_1.paymentService.listForUser(req.user.id, req.user.role) });
});
const getById = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, {
        message: "Payment retrieved",
        data: await payment_service_1.paymentService.getById(req.user.id, req.user.role, String(req.params.id))
    });
});
exports.paymentController = { create, confirm, stripeWebhook, sslSuccess, sslIpn, sslFail, sslCancel, list, getById };
//# sourceMappingURL=payment.controller.js.map