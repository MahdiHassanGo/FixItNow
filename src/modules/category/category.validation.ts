import { z } from "zod";

const create = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional()
  })
});

const update = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional()
  })
});

const idParam = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const categoryValidation = {
  create,
  update,
  idParam
};