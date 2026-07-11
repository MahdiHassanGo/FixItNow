import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post("/", auth(Role.CUSTOMER), validateRequest(reviewValidation.create), reviewController.create);
router.get("/technician/:technicianId", validateRequest(reviewValidation.technicianIdParam), reviewController.getTechnicianReviews);

export const reviewRoutes = router;
