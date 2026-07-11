import { z } from "zod";

const createCheckout = z.object({
  body: z.object({
    bookingId: z.string().uuid()
  })
});

const idParam = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const paymentValidation = {
  createCheckout,
  idParam
};