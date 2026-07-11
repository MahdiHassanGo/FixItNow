import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validateRequest";
import { technicianController } from "./technician.controller";
import {
  technicianBookingStatusSchema,
  technicianIdSchema,
  technicianQuerySchema,
  updateAvailabilitySchema,
  updateTechnicianProfileSchema
} from "./technician.schemas";

export const publicTechnicianRouter = Router();
publicTechnicianRouter.get("/", validateRequest(technicianQuerySchema), technicianController.list);
publicTechnicianRouter.get("/:id", validateRequest(technicianIdSchema), technicianController.getById);

export const technicianDashboardRouter = Router();
technicianDashboardRouter.use(authenticate(Role.TECHNICIAN));
technicianDashboardRouter.put("/profile", validateRequest(updateTechnicianProfileSchema), technicianController.updateProfile);
technicianDashboardRouter.put("/availability", validateRequest(updateAvailabilitySchema), technicianController.updateAvailability);
technicianDashboardRouter.get("/bookings", technicianController.bookings);
technicianDashboardRouter.patch("/bookings/:id", validateRequest(technicianBookingStatusSchema), technicianController.updateBookingStatus);
