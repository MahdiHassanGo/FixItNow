import type { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncRoute = (handler: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
