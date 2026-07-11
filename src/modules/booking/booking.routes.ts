import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validateRequest";
import { bookingController } from "./booking.controller";
import { bookingIdSchema, createBookingSchema } from "./booking.schemas";

export const bookingRouter = Router();
bookingRouter.post("/", authenticate(Role.CUSTOMER), validateRequest(createBookingSchema), bookingController.create);
bookingRouter.get("/", authenticate(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), bookingController.list);
bookingRouter.get("/:id", authenticate(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), validateRequest(bookingIdSchema), bookingController.getById);
bookingRouter.patch("/:id/cancel", authenticate(Role.CUSTOMER, Role.ADMIN), validateRequest(bookingIdSchema), bookingController.cancel);
