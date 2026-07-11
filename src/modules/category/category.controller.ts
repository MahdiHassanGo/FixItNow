import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await categoryService.create(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: result
  });
});

const getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await categoryService.getAll();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: result
  });
});

const update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await categoryService.update(String(req.params.id), req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category updated successfully",
    data: result
  });
});

const remove = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await categoryService.remove(String(req.params.id));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category deleted successfully",
    data: result
  });
});

export const categoryController = {
  create,
  getAll,
  update,
  remove
};