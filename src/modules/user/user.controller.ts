import type { Request, Response } from "express";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { userService } from "./user.service";

const updateMe = asyncRoute(async (req: Request, res: Response) => {
  const user = await userService.updateMyProfile(req.user!.id, req.body);
  respond(res, { message: "Profile updated successfully", data: user });
});

export const userController = { updateMe };
