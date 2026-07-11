import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: config.nodeEnv === "production" ? "none" : "lax"
} as const;

const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await authService.register(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result
  });
});

const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await authService.login(req.body);

  res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 });
  res.cookie("refreshToken", result.refreshToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: result
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refreshToken(token);

  res.cookie("accessToken", result.accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Access token refreshed successfully",
    data: result
  });
});

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await authService.getMe(req.user!.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Current user retrieved successfully",
    data: result
  });
});

export const authController = {
  register,
  login,
  refreshToken,
  getMe
};
