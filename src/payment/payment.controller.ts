import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await paymentService.createCheckoutSession(req.user!.id, req.body.bookingId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stripe checkout session created successfully",
    data: result
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers["stripe-signature"] as string;
  const result = await paymentService.handleWebhook(req.body as Buffer, signature);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stripe webhook handled successfully",
    data: result
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await paymentService.getMyPayments(req.user!.id, req.user!.role);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments retrieved successfully",
    data: result
  });
});

const getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await paymentService.getById(req.user!.id, req.user!.role, String(req.params.id));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment retrieved successfully",
    data: result
  });
});

export const paymentController = {
  createCheckoutSession,
  handleWebhook,
  getMyPayments,
  getById
};
