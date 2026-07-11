"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.technicianBookingStatusSchema = exports.updateAvailabilitySchema = exports.updateTechnicianProfileSchema = exports.technicianQuerySchema = exports.technicianIdSchema = void 0;
const zod_1 = require("zod");
const hhmm = zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");
exports.technicianIdSchema = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string().uuid() }) });
exports.technicianQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().trim().optional(),
        searchTerm: zod_1.z.string().trim().optional(),
        skill: zod_1.z.string().trim().optional(),
        location: zod_1.z.string().trim().optional(),
        categoryId: zod_1.z.string().uuid().optional(),
        serviceType: zod_1.z.string().trim().optional(),
        minRating: zod_1.z.coerce.number().min(0).max(5).optional(),
        minPrice: zod_1.z.coerce.number().nonnegative().optional(),
        maxPrice: zod_1.z.coerce.number().nonnegative().optional(),
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
        sortBy: zod_1.z.enum(["createdAt", "rating", "totalReviews", "experienceYears", "pricePerHour"]).optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional()
    })
        .refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, {
        message: "minPrice cannot be greater than maxPrice"
    })
});
exports.updateTechnicianProfileSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        bio: zod_1.z.string().trim().max(3000).nullable().optional(),
        skills: zod_1.z.array(zod_1.z.string().trim().min(1).max(80)).max(30).optional(),
        experienceYears: zod_1.z.coerce.number().int().min(0).max(80).optional(),
        pricePerHour: zod_1.z.coerce.number().nonnegative().optional(),
        location: zod_1.z.string().trim().min(2).max(180).nullable().optional(),
        timezone: zod_1.z.string().trim().min(3).max(80).optional()
    })
        .refine((body) => Object.keys(body).length > 0, "Provide at least one profile field")
});
exports.updateAvailabilitySchema = zod_1.z.object({
    body: zod_1.z.object({
        slots: zod_1.z
            .array(zod_1.z.object({
            dayOfWeek: zod_1.z.enum(["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
            startTime: hhmm,
            endTime: hhmm,
            isAvailable: zod_1.z.boolean().optional()
        }))
            .max(50)
    })
});
exports.technicianBookingStatusSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({ status: zod_1.z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"]) })
});
//# sourceMappingURL=technician.schemas.js.map