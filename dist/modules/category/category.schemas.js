"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = exports.categoryIdSchema = void 0;
const zod_1 = require("zod");
exports.categoryIdSchema = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string().uuid() }) });
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(2).max(100),
        description: zod_1.z.string().trim().max(1000).optional()
    })
});
exports.updateCategorySchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z
        .object({
        name: zod_1.z.string().trim().min(2).max(100).optional(),
        description: zod_1.z.string().trim().max(1000).nullable().optional()
    })
        .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update")
});
//# sourceMappingURL=category.schemas.js.map