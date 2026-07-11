import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { prisma } from "../../lib/prisma";

const getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: categories
  });
});

const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await prisma.category.create({ data: req.body });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: category
  });
});

export const categoryController = {
  getAll,
  create
};
