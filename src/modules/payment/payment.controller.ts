import { PaymentStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { paymentService } from "./payment.service";

const create = asyncRoute(async (req: Request, res: Response) => {
  const result = await paymentService.create(req.user!.id, req.body.bookingId, req.body.provider);
  respond(res, { statusCode: 201, message: "Payment session created", data: result });
});

const confirm = asyncRoute(async (req: Request, res: Response) => {
  const payment = await paymentService.confirm(req.user!.id, req.user!.role, req.body.provider, req.body);
  respond(res, { message: "Payment confirmed", data: payment });
});

const stripeWebhook = asyncRoute(async (req: Request, res: Response) => {
  const result = await paymentService.handleStripeWebhook(req.body as Buffer, req.headers["stripe-signature"] as string | undefined);
  respond(res, { message: "Stripe webhook processed", data: result });
});

const sslSuccess = asyncRoute(async (req: Request, res: Response) => {
  const payment = await paymentService.handleSslSuccess(req.body);
  respond(res, { message: "SSLCOMMERZ payment confirmed", data: payment });
});

const sslIpn = asyncRoute(async (req: Request, res: Response) => {
  const payment = await paymentService.handleSslSuccess(req.body);
  respond(res, { message: "SSLCOMMERZ IPN processed", data: payment });
});

const sslFail = asyncRoute(async (req: Request, res: Response) => {
  const result = await paymentService.handleSslFailure(req.body, PaymentStatus.FAILED);
  respond(res, { message: "SSLCOMMERZ payment failed", data: result });
});

const sslCancel = asyncRoute(async (req: Request, res: Response) => {
  const result = await paymentService.handleSslFailure(req.body, PaymentStatus.CANCELLED);
  respond(res, { message: "SSLCOMMERZ payment cancelled", data: result });
});

const list = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Payments retrieved", data: await paymentService.listForUser(req.user!.id, req.user!.role) });
});

const getById = asyncRoute(async (req: Request, res: Response) => {
  respond(res, {
    message: "Payment retrieved",
    data: await paymentService.getById(req.user!.id, req.user!.role, String(req.params.id))
  });
});

export const paymentController = { create, confirm, stripeWebhook, sslSuccess, sslIpn, sslFail, sslCancel, list, getById };
