import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { bookingController } from "./booking.controller";
import { bookingValidation } from "./booking.validation";

const router = Router();

router.post("/", auth(Role.CUSTOMER), validateRequest(bookingValidation.create), bookingController.create);
router.get("/", auth(Role.CUSTOMER, Role.ADMIN), bookingController.getMyBookings);
router.get("/:id", auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), validateRequest(bookingValidation.idParam), bookingController.getById);
router.patch("/:id/cancel", auth(Role.CUSTOMER, Role.ADMIN), validateRequest(bookingValidation.idParam), bookingController.cancel);

export const bookingRoutes = router;
