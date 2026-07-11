import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await userService.updateMe(req.user!.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result
  });
});

export const userController = {
  updateMe
};
