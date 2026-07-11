"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: node_path_1.default.resolve(process.cwd(), ".env") });
const optionalUrl = zod_1.z.string().url().optional().or(zod_1.z.literal(""));
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(5000),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    BCRYPT_SALT_ROUNDS: zod_1.z.coerce.number().int().min(8).max(15).default(12),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default("1d"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    APP_URL: zod_1.z.string().url().default("http://localhost:5000"),
    FRONTEND_URL: zod_1.z.string().default("http://localhost:3000"),
    STRIPE_SECRET_KEY: zod_1.z.string().optional().default(""),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional().default(""),
    STRIPE_CURRENCY: zod_1.z.string().length(3).default("usd"),
    STRIPE_SUCCESS_URL: optionalUrl.default("http://localhost:3000/payment/success"),
    STRIPE_CANCEL_URL: optionalUrl.default("http://localhost:3000/payment/cancel"),
    SSLCOMMERZ_STORE_ID: zod_1.z.string().optional().default(""),
    SSLCOMMERZ_STORE_PASSWORD: zod_1.z.string().optional().default(""),
    SSLCOMMERZ_IS_LIVE: zod_1.z
        .string()
        .optional()
        .default("false")
        .transform((value) => value.toLowerCase() === "true"),
    SSLCOMMERZ_CURRENCY: zod_1.z.string().length(3).default("BDT"),
    SSLCOMMERZ_SUCCESS_URL: optionalUrl.default("http://localhost:5000/api/payments/sslcommerz/success"),
    SSLCOMMERZ_FAIL_URL: optionalUrl.default("http://localhost:5000/api/payments/sslcommerz/fail"),
    SSLCOMMERZ_CANCEL_URL: optionalUrl.default("http://localhost:5000/api/payments/sslcommerz/cancel"),
    SSLCOMMERZ_IPN_URL: optionalUrl.default("http://localhost:5000/api/payments/sslcommerz/ipn")
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
}
const env = parsed.data;
exports.config = {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
    jwt: {
        accessSecret: env.JWT_ACCESS_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
        accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
    },
    appUrl: env.APP_URL,
    frontendOrigins: env.FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean),
    stripe: {
        secretKey: env.STRIPE_SECRET_KEY,
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
        currency: env.STRIPE_CURRENCY.toLowerCase(),
        successUrl: env.STRIPE_SUCCESS_URL,
        cancelUrl: env.STRIPE_CANCEL_URL
    },
    sslCommerz: {
        storeId: env.SSLCOMMERZ_STORE_ID,
        storePassword: env.SSLCOMMERZ_STORE_PASSWORD,
        isLive: env.SSLCOMMERZ_IS_LIVE,
        currency: env.SSLCOMMERZ_CURRENCY.toUpperCase(),
        successUrl: env.SSLCOMMERZ_SUCCESS_URL,
        failUrl: env.SSLCOMMERZ_FAIL_URL,
        cancelUrl: env.SSLCOMMERZ_CANCEL_URL,
        ipnUrl: env.SSLCOMMERZ_IPN_URL
    }
};
//# sourceMappingURL=index.js.map