import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { config } from "./config";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { paymentController } from "./modules/payment/payment.controller";
import { apiRouter } from "./routes";

export const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    }
  })
);

// Stripe signatures require the untouched request body, so this route must be registered before express.json().
app.post("/api/payments/stripe/webhook", express.raw({ type: "application/json" }), paymentController.stripeWebhook);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "FixItNow API is running", documentation: "/api/health" });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    statusCode: 200,
    message: "FixItNow API is healthy",
    data: { environment: config.nodeEnv, timestamp: new Date().toISOString() }
  });
});

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);
