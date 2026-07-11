import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../core/ApiError";

export const validateRequest = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies
    });

    if (!parsed.success) {
      throw new ApiError(
        400,
        "Request validation failed",
        parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      );
    }

    const data = parsed.data as {
      body?: unknown;
      query?: Request["query"];
      params?: Request["params"];
    };

    if (data.body !== undefined) req.body = data.body;
    if (data.params !== undefined) req.params = data.params;
    if (data.query !== undefined) {
      Object.defineProperty(req, "query", { value: data.query, configurable: true });
    }
    next();
  };
};
