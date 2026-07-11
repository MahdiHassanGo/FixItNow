import { Router } from "express";
import { Prisma } from "@prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { categoryController } from "../category/category.controller";
import { categoryValidation } from "../category/category.validation";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

const router = Router();

router.get("/users", auth(Prisma.Role.ADMIN), adminController.getUsers);
router.patch("/users/:id/status", auth(Prisma.Role.ADMIN), validateRequest(adminValidation.updateUserStatus), adminController.updateUserStatus);
router.get("/bookings", auth(Prisma.Role.ADMIN), adminController.getAllBookings);
router.get("/payments", auth(Prisma.Role.ADMIN), adminController.getAllPayments);
router.get("/categories", auth(Prisma.Role.ADMIN), categoryController.getAll);
router.post("/categories", auth(Prisma.Role.ADMIN), validateRequest(categoryValidation.create), categoryController.create);

export const adminRoutes = router;
