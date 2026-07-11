import { z } from "zod";

export const serviceIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const serviceQuerySchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),
      searchTerm: z.string().trim().optional(),
      categoryId: z.string().uuid().optional(),
      type: z.string().trim().optional(),
      location: z.string().trim().optional(),
      minRating: z.coerce.number().min(0).max(5).optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
      technicianId: z.string().uuid().optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      sortBy: z.enum(["createdAt", "price", "title", "rating"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional()
    })
    .refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, {
      message: "minPrice cannot be greater than maxPrice"
    })
});

export const createServiceSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().min(10).max(3000),
    price: z.coerce.number().positive(),
    location: z.string().trim().min(2).max(180).optional(),
    categoryId: z.string().uuid()
  })
});

export const updateServiceSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z
    .object({
      title: z.string().trim().min(3).max(160).optional(),
      description: z.string().trim().min(10).max(3000).optional(),
      price: z.coerce.number().positive().optional(),
      location: z.string().trim().min(2).max(180).nullable().optional(),
      categoryId: z.string().uuid().optional(),
      isActive: z.boolean().optional()
    })
    .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update")
});
