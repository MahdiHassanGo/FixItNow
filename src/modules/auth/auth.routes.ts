import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), authController.register);
authRouter.post("/login", validateRequest(loginSchema), authController.login);
authRouter.post("/refresh", validateRequest(refreshSchema), authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), authController.me);
