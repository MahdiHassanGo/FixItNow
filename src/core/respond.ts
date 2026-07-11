import type { Response } from "express";

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type SuccessPayload<T> = {
  statusCode?: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
};

export const respond = <T>(res: Response, payload: SuccessPayload<T>): void => {
  const statusCode = payload.statusCode ?? 200;
  res.status(statusCode).json({
    success: true,
    statusCode,
    message: payload.message,
    data: payload.data,
    ...(payload.meta ? { meta: payload.meta } : {})
  });
};
