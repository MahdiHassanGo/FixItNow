import { z } from "zod";

const provider = z.enum(["STRIPE", "SSLCOMMERZ"]);

export const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid(),
    provider
  })
});

export const confirmPaymentSchema = z.object({
  body: z
    .object({
      provider,
      sessionId: z.string().optional(),
      validationId: z.string().optional()
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

export const paymentIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
