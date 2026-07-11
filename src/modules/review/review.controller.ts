import type { Request, Response } from "express";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { reviewService } from "./review.service";

const create = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { statusCode: 201, message: "Review submitted", data: await reviewService.create(req.user!.id, req.body) });
});

const listForTechnician = asyncRoute(async (req: Request, res: Response) => {
  respond(res, {
    message: "Technician reviews retrieved",
    data: await reviewService.listForTechnician(String(req.params.technicianId))
  });
});

export const reviewController = { create, listForTechnician };
