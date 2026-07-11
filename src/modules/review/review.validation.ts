import { z } from "zod";

const create = z.object({
  body: z.object({
    bookingId: z.string().uuid(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().optional()
  })
});

const technicianIdParam = z.object({
  params: z.object({ technicianId: z.string().uuid() })
});

export const reviewValidation = {
  create,
  technicianIdParam
};
