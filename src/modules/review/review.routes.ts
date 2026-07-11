import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { createReviewSchema, technicianReviewSchema } from "./review.schemas";

export const reviewRouter = Router();
reviewRouter.post("/", authenticate(Role.CUSTOMER), validateRequest(createReviewSchema), reviewController.create);
reviewRouter.get("/technician/:technicianId", validateRequest(technicianReviewSchema), reviewController.listForTechnician);
