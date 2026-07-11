import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { config } from "../config";
import { ApiError } from "../core/ApiError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      statusCode = 409;
      message = "A record with the same unique value already exists";
      details = error.meta;
    } else if (error.code === "P2025") {
      statusCode = 404;
      message = "Requested record was not found";
    }
  } else if (error instanceof Error && error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (statusCode === 500) console.error(error);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(details !== undefined ? { details } : {}),
    ...(config.nodeEnv !== "production" && error instanceof Error ? { stack: error.stack } : {})
  });
};
