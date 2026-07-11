import { z } from "zod";

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

export const technicianIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const technicianQuerySchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),
      searchTerm: z.string().trim().optional(),
      skill: z.string().trim().optional(),
      location: z.string().trim().optional(),
      categoryId: z.string().uuid().optional(),
      serviceType: z.string().trim().optional(),
      minRating: z.coerce.number().min(0).max(5).optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      sortBy: z.enum(["createdAt", "rating", "totalReviews", "experienceYears", "pricePerHour"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional()
    })
    .refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, {
      message: "minPrice cannot be greater than maxPrice"
    })
});

export const updateTechnicianProfileSchema = z.object({
  body: z
    .object({
      bio: z.string().trim().max(3000).nullable().optional(),
      skills: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
      experienceYears: z.coerce.number().int().min(0).max(80).optional(),
      pricePerHour: z.coerce.number().nonnegative().optional(),
      location: z.string().trim().min(2).max(180).nullable().optional(),
      timezone: z.string().trim().min(3).max(80).optional()
    })
    .refine((body) => Object.keys(body).length > 0, "Provide at least one profile field")
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    slots: z
      .array(
        z.object({
          dayOfWeek: z.enum(["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
          startTime: hhmm,
          endTime: hhmm,
          isAvailable: z.boolean().optional()
        })
      )
      .max(50)
  })
});

export const technicianBookingStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"]) })
});
