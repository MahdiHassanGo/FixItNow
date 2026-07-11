import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(authValidation.register), authController.register);
router.post("/login", validateRequest(authValidation.login), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), authController.getMe);

export const authRoutes = router;
