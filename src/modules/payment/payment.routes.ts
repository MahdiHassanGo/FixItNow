import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import { confirmPaymentSchema, createPaymentSchema, paymentIdSchema } from "./payment.schemas";

export const paymentRouter = Router();
paymentRouter.post("/create", authenticate(Role.CUSTOMER), validateRequest(createPaymentSchema), paymentController.create);
paymentRouter.post("/create-checkout-session", authenticate(Role.CUSTOMER), validateRequest(createPaymentSchema), paymentController.create);
paymentRouter.post("/confirm", authenticate(Role.CUSTOMER, Role.ADMIN), validateRequest(confirmPaymentSchema), paymentController.confirm);
paymentRouter.post("/sslcommerz/success", paymentController.sslSuccess);
paymentRouter.post("/sslcommerz/ipn", paymentController.sslIpn);
paymentRouter.post("/sslcommerz/fail", paymentController.sslFail);
paymentRouter.post("/sslcommerz/cancel", paymentController.sslCancel);
paymentRouter.get("/", authenticate(Role.CUSTOMER, Role.ADMIN), paymentController.list);
paymentRouter.get("/:id", authenticate(Role.CUSTOMER, Role.ADMIN), validateRequest(paymentIdSchema), paymentController.getById);
