import { z } from "zod";

const create = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    scheduledAt: z.coerce.date(),
    address: z.string().min(5),
    note: z.string().optional()
  })
});

const idParam = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const bookingValidation = {
  create,
  idParam
};
