"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentIdSchema = exports.confirmPaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
const provider = zod_1.z.enum(["STRIPE", "SSLCOMMERZ"]);
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        bookingId: zod_1.z.string().uuid(),
        provider
    })
});
exports.confirmPaymentSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        provider,
        sessionId: zod_1.z.string().optional(),
        validationId: zod_1.z.string().optional()
    })
        .superRefine((body, ctx) => {
        if (body.provider === "STRIPE" && !body.sessionId) {
            ctx.addIssue({ code: "custom", path: ["sessionId"], message: "sessionId is required for Stripe" });
        }
        if (body.provider === "SSLCOMMERZ" && !body.validationId) {
            ctx.addIssue({ code: "custom", path: ["validationId"], message: "validationId is required for SSLCOMMERZ" });
        }
    })
});
exports.paymentIdSchema = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string().uuid() }) });
//# sourceMappingURL=payment.schemas.js.map