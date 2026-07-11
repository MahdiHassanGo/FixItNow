import { z } from "zod";

export const categoryIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(1000).optional()
  })
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      description: z.string().trim().max(1000).nullable().optional()
    })
    .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update")
});
