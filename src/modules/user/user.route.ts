import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

router.patch("/me", auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), validateRequest(userValidation.updateMe), userController.updateMe);

export const userRoutes = router;
