import { z } from "zod";

export const updateMyProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      phone: z.string().trim().min(6).max(30).nullable().optional(),
      location: z.string().trim().min(2).max(180).nullable().optional()
    })
    .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update")
});
