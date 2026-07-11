import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { serviceService } from "./service.service";

const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await serviceService.create(req.user!.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Service created successfully",
    data: result
  });
});

const getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await serviceService.getAll(req.query as never);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Services retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

const getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await serviceService.getById(String(req.params.id));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service retrieved successfully",
    data: result
  });
});

const update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await serviceService.update(req.user!.id, req.user!.role, String(req.params.id), req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service updated successfully",
    data: result
  });
});

const remove = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await serviceService.remove(req.user!.id, req.user!.role, String(req.params.id));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service removed successfully",
    data: result
  });
});

const getMyServices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await serviceService.getMyServices(req.user!.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My services retrieved successfully",
    data: result
  });
});

export const serviceController = {
  create,
  getAll,
  getById,
  update,
  remove,
  getMyServices
};