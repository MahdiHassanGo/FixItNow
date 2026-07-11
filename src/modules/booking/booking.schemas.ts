import { z } from "zod";

export const bookingIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    scheduledAt: z.coerce.date(),
    address: z.string().trim().min(5).max(500),
    note: z.string().trim().max(1500).optional()
  })
});
