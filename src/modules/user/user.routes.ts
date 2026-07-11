import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { updateMyProfileSchema } from "./user.schemas";

export const userRouter = Router();
userRouter.patch("/me", authenticate(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), validateRequest(updateMyProfileSchema), userController.updateMe);
