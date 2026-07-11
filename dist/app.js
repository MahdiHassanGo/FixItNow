"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const errorHandler_1 = require("./middlewares/errorHandler");
const notFound_1 = require("./middlewares/notFound");
const payment_controller_1 = require("./modules/payment/payment.controller");
const routes_1 = require("./routes");
exports.app = (0, express_1.default)();
exports.app.disable("x-powered-by");
exports.app.use((0, cors_1.default)({
    credentials: true,
    origin(origin, callback) {
        if (!origin || config_1.config.frontendOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
    }
}));
// Stripe signatures require the untouched request body, so this route must be registered before express.json().
exports.app.post("/api/payments/stripe/webhook", express_1.default.raw({ type: "application/json" }), payment_controller_1.paymentController.stripeWebhook);
exports.app.use(express_1.default.json({ limit: "1mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.get("/", (_req, res) => {
    res.json({ success: true, message: "FixItNow API is running", documentation: "/api/health" });
});
exports.app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        statusCode: 200,
        message: "FixItNow API is healthy",
        data: { environment: config_1.config.nodeEnv, timestamp: new Date().toISOString() }
    });
});
exports.app.use("/api", routes_1.apiRouter);
exports.app.use(notFound_1.notFound);
exports.app.use(errorHandler_1.errorHandler);
//# sourceMappingURL=app.js.map