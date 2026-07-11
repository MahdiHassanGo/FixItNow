import { z } from "zod";

const query = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    location: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    sortBy: z.enum(["createdAt", "price", "title"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
});

const create = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    price: z.coerce.number().min(1),
    location: z.string().optional(),
    categoryId: z.string().uuid()
  })
});

const update = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    price: z.coerce.number().min(1).optional(),
    location: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    isActive: z.boolean().optional()
  })
});

const idParam = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const serviceValidation = {
  query,
  create,
  update,
  idParam
};
