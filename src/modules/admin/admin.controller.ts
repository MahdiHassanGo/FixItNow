import type { Request, Response } from "express";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { adminService } from "./admin.service";

const users = asyncRoute(async (req: Request, res: Response) => {
  const result = await adminService.listUsers(req.query as never);
  respond(res, { message: "Users retrieved", data: result.data, meta: result.meta });
});

const updateUserStatus = asyncRoute(async (req: Request, res: Response) => {
  respond(res, {
    message: "User status updated",
    data: await adminService.updateUserStatus(req.user!.id, String(req.params.id), req.body.activeStatus)
  });
});

const bookings = asyncRoute(async (_req: Request, res: Response) => {
  respond(res, { message: "All bookings retrieved", data: await adminService.listBookings() });
});

const payments = asyncRoute(async (_req: Request, res: Response) => {
  respond(res, { message: "All payments retrieved", data: await adminService.listPayments() });
});

export const adminController = { users, updateUserStatus, bookings, payments };
