import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export const globalErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorDetails: err.errorDetails
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errorDetails: err instanceof Error ? err.message : err
  });
};
