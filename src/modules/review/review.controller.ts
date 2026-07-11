import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await reviewService.create(req.user!.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review created successfully",
    data: result
  });
});

const getTechnicianReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await reviewService.getTechnicianReviews(String(req.params.technicianId));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully",
    data: result
  });
});

export const reviewController = {
  create,
  getTechnicianReviews
};
