import { z } from "zod";

const query = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    skill: z.string().optional(),
    location: z.string().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    sortBy: z.enum(["createdAt", "rating", "totalReviews", "experienceYears", "pricePerHour"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
});

const updateProfile = z.object({
  body: z.object({
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experienceYears: z.coerce.number().int().nonnegative().optional(),
    pricePerHour: z.coerce.number().nonnegative().optional(),
    location: z.string().optional()
  })
});

const updateAvailability = z.object({
  body: z.object({
    slots: z.array(
      z.object({
        dayOfWeek: z.enum(["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
        startTime: z.string().min(4),
        endTime: z.string().min(4),
        isAvailable: z.boolean().optional()
      })
    )
  })
});

const idParam = z.object({
  params: z.object({ id: z.string().uuid() })
});

const bookingStatus = z.object({
  params: z.object({ bookingId: z.string().uuid() }),
  body: z.object({
    status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"])
  })
});

export const technicianValidation = {
  query,
  updateProfile,
  updateAvailability,
  idParam,
  bookingStatus
};
