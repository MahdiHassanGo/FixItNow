import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(2000).optional()
  })
});

export const technicianReviewSchema = z.object({
  params: z.object({ technicianId: z.string().uuid() })
});
