import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { adminRoutes } from "./modules/admin/admin.route";
import { authRoutes } from "./modules/auth/auth.route";
import { bookingRoutes } from "./modules/booking/booking.route";
import { categoryRoutes } from "./modules/category/category.route";
import { paymentController } from "./modules/payment/payment.controller";
import { paymentRoutes } from "./modules/payment/payment.route";
import { reviewRoutes } from "./modules/review/review.route";
import { serviceRoutes } from "./modules/service/service.route";
import { technicianRoutes } from "./modules/technician/technician.route";
import { userRoutes } from "./modules/user/user.route";

const app: Application = express();

app.use(
  cors({
    origin: [config.frontendUrl, config.appUrl],
    credentials: true
  })
);

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), paymentController.handleWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "FixItNow API is running" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ success: true, message: "Server health is okay" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;