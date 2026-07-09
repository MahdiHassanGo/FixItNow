import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const readEnv = (key: string, fallback?: string) => {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`${key} is missing in environment variables`);
  }
  return value;
};

export default {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || "5000",
  databaseUrl: readEnv("DATABASE_URL"),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  jwtAccessSecret: readEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: readEnv("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  appUrl: process.env.APP_URL || "http://localhost:5000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  stripeSecretKey: readEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL || "http://localhost:5000/payment-success",
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL || "http://localhost:5000/payment-cancel"
};