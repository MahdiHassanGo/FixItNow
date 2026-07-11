import type { Request, Response } from "express";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { serviceService } from "./service.service";

const list = asyncRoute(async (req: Request, res: Response) => {
  const result = await serviceService.list(req.query as never);
  respond(res, { message: "Services retrieved", data: result.data, meta: result.meta });
});

const getById = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Service retrieved", data: await serviceService.getById(String(req.params.id)) });
});

const mine = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Your services retrieved", data: await serviceService.listMine(req.user!.id) });
});

const create = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { statusCode: 201, message: "Service created", data: await serviceService.create(req.user!.id, req.body) });
});

const update = asyncRoute(async (req: Request, res: Response) => {
  respond(res, {
    message: "Service updated",
    data: await serviceService.update(req.user!.id, req.user!.role, String(req.params.id), req.body)
  });
});

const archive = asyncRoute(async (req: Request, res: Response) => {
  respond(res, {
    message: "Service removed",
    data: await serviceService.archive(req.user!.id, req.user!.role, String(req.params.id))
  });
});

export const serviceController = { list, getById, mine, create, update, archive };
