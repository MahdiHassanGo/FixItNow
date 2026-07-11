import { NextFunction, Request, Response } from "express";
import { ZodIssue, ZodTypeAny } from "zod";
import { AppError } from "../errors/AppError";

export const validateRequest = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies
    });

    if (!result.success) {
      const errorDetails = result.error.issues.map((issue: ZodIssue) => ({
        path: issue.path.join("."),
        message: issue.message
      }));

      throw new AppError(400, "Validation Error", errorDetails);
    }

    const parsedData = result.data as {
      body?: unknown;
      query?: Request["query"];
      params?: Request["params"];
      cookies?: unknown;
    };

    if (parsedData.body !== undefined) {
      req.body = parsedData.body;
    }

    if (parsedData.query !== undefined) {
      Object.defineProperty(req, "query", {
        value: parsedData.query,
        writable: true,
        configurable: true
      });
    }

    if (parsedData.params !== undefined) {
      req.params = parsedData.params;
    }

    next();
  };
};