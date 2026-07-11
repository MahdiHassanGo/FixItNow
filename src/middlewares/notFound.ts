import type { Request, Response } from "express";

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
    details: { method: req.method, path: req.originalUrl }
  });
};
