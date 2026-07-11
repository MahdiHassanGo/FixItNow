import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const router = Router();

router.post("/create-checkout-session", auth(Role.CUSTOMER), validateRequest(paymentValidation.createCheckout),
  paymentController.createCheckoutSession);
router.post("/create", auth(Role.CUSTOMER), validateRequest(paymentValidation.createCheckout), paymentController.createCheckoutSession);
router.get("/", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getMyPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), validateRequest(paymentValidation.idParam), paymentController.getById);

export const paymentRoutes = router;
