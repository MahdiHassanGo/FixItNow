"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceSchema = exports.createServiceSchema = exports.serviceQuerySchema = exports.serviceIdSchema = void 0;
const zod_1 = require("zod");
exports.serviceIdSchema = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string().uuid() }) });
exports.serviceQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().trim().optional(),
        searchTerm: zod_1.z.string().trim().optional(),
        categoryId: zod_1.z.string().uuid().optional(),
        type: zod_1.z.string().trim().optional(),
        location: zod_1.z.string().trim().optional(),
        minRating: zod_1.z.coerce.number().min(0).max(5).optional(),
        minPrice: zod_1.z.coerce.number().nonnegative().optional(),
        maxPrice: zod_1.z.coerce.number().nonnegative().optional(),
        technicianId: zod_1.z.string().uuid().optional(),
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
        sortBy: zod_1.z.enum(["createdAt", "price", "title", "rating"]).optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional()
    })
        .refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, {
        message: "minPrice cannot be greater than maxPrice"
    })
});
exports.createServiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().trim().min(3).max(160),
        description: zod_1.z.string().trim().min(10).max(3000),
        price: zod_1.z.coerce.number().positive(),
        location: zod_1.z.string().trim().min(2).max(180).optional(),
        categoryId: zod_1.z.string().uuid()
    })
});
exports.updateServiceSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z
        .object({
        title: zod_1.z.string().trim().min(3).max(160).optional(),
        description: zod_1.z.string().trim().min(10).max(3000).optional(),
        price: zod_1.z.coerce.number().positive().optional(),
        location: zod_1.z.string().trim().min(2).max(180).nullable().optional(),
        categoryId: zod_1.z.string().uuid().optional(),
        isActive: zod_1.z.boolean().optional()
    })
        .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update")
});
//# sourceMappingURL=service.schemas.js.map