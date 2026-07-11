import { z } from "zod";

const updateMe = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    location: z.string().optional()
  })
});

export const userValidation = {
  updateMe
};
