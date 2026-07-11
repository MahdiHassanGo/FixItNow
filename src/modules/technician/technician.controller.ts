import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { BookingStatus } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { technicianService } from "./technician.service";

const getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await technicianService.getAll(req.query as never);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technicians retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

const getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await technicianService.getById(String(req.params.id));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician retrieved successfully",
    data: result
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await technicianService.updateProfile(req.user!.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician profile updated successfully",
    data: result
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await technicianService.updateAvailability(req.user!.id, req.body.slots);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability updated successfully",
    data: result
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await technicianService.getMyBookings(req.user!.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician bookings retrieved successfully",
    data: result
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await technicianService.updateBookingStatus(req.user!.id, String(req.params.bookingId), req.body.status as BookingStatus);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking status updated successfully",
    data: result
  });
});

export const technicianController = {
  getAll,
  getById,
  updateProfile,
  updateAvailability,
  getMyBookings,
  updateBookingStatus
};
