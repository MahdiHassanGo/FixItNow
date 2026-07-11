import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getUsers();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.updateUserStatus(String(req.params.id), req.body.activeStatus);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: result
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getAllBookings();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All bookings retrieved successfully",
    data: result
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getAllPayments();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All payments retrieved successfully",
    data: result
  });
});

export const adminController = {
  getUsers,
  updateUserStatus,
  getAllBookings,
  getAllPayments
};
