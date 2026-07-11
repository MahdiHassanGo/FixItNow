import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { bookingService } from "./booking.service";

const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await bookingService.create(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking created successfully",
    data: result
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await bookingService.getMyBookings(req.user!.id, req.user!.role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    data: result
  });
});

const getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await bookingService.getById(
    req.user!.id,
    req.user!.role,
    String(req.params.id)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking retrieved successfully",
    data: result
  });
});

const cancel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await bookingService.cancel(
    req.user!.id,
    req.user!.role,
    String(req.params.id)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking cancelled successfully",
    data: result
  });
});

export const bookingController = {
  create,
  getMyBookings,
  getById,
  cancel
};