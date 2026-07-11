import type { Request, Response } from "express";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { bookingService } from "./booking.service";

const create = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { statusCode: 201, message: "Booking requested", data: await bookingService.create(req.user!.id, req.body) });
});

const list = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Bookings retrieved", data: await bookingService.listForUser(req.user!.id, req.user!.role) });
});

const getById = asyncRoute(async (req: Request, res: Response) => {
  respond(res, {
    message: "Booking retrieved",
    data: await bookingService.getById(req.user!.id, req.user!.role, String(req.params.id))
  });
});

const cancel = asyncRoute(async (req: Request, res: Response) => {
  respond(res, {
    message: "Booking cancelled",
    data: await bookingService.cancel(req.user!.id, req.user!.role, String(req.params.id))
  });
});

export const bookingController = { create, list, getById, cancel };
