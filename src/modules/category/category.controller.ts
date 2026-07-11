import type { Request, Response } from "express";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { categoryService } from "./category.service";

const list = asyncRoute(async (_req: Request, res: Response) => {
  respond(res, { message: "Categories retrieved", data: await categoryService.list() });
});

const create = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { statusCode: 201, message: "Category created", data: await categoryService.create(req.body) });
});

const update = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Category updated", data: await categoryService.update(String(req.params.id), req.body) });
});

const remove = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Category deleted", data: await categoryService.remove(String(req.params.id)) });
});

export const categoryController = { list, create, update, remove };
