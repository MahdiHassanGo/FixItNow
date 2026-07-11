import type { Request, Response } from "express";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { technicianService } from "./technician.service";

const list = asyncRoute(async (req: Request, res: Response) => {
  const result = await technicianService.list(req.query as never);
  respond(res, { message: "Technicians retrieved", data: result.data, meta: result.meta });
});

const getById = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Technician profile retrieved", data: await technicianService.getById(String(req.params.id)) });
});

const updateProfile = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Technician profile updated", data: await technicianService.updateProfile(req.user!.id, req.body) });
});

const updateAvailability = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Availability updated", data: await technicianService.replaceAvailability(req.user!.id, req.body.slots) });
});

const bookings = asyncRoute(async (req: Request, res: Response) => {
  respond(res, { message: "Technician bookings retrieved", data: await technicianService.listBookings(req.user!.id) });
});

const updateBookingStatus = asyncRoute(async (req: Request, res: Response) => {
  respond(res, {
    message: "Booking status updated",
    data: await technicianService.changeBookingStatus(req.user!.id, String(req.params.id), req.body.status)
  });
});

export const technicianController = { list, getById, updateProfile, updateAvailability, bookings, updateBookingStatus };
