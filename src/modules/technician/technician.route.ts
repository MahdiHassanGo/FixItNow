import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { technicianController } from "./technician.controller";
import { technicianValidation } from "./technician.validation";

const router = Router();

router.get("/", validateRequest(technicianValidation.query), technicianController.getAll);
router.get("/bookings", auth(Role.TECHNICIAN), technicianController.getMyBookings);
router.get("/:id", validateRequest(technicianValidation.idParam), technicianController.getById);
router.put("/profile", auth(Role.TECHNICIAN), validateRequest(technicianValidation.updateProfile), technicianController.updateProfile);
router.put("/availability", auth(Role.TECHNICIAN), validateRequest(technicianValidation.updateAvailability), technicianController.updateAvailability);
router.patch("/bookings/:bookingId/status", auth(Role.TECHNICIAN), validateRequest(technicianValidation.bookingStatus),
  technicianController.updateBookingStatus);

export const technicianRoutes = router;
