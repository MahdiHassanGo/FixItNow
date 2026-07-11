"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateMyProfileSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().trim().min(2).max(120).optional(),
        phone: zod_1.z.string().trim().min(6).max(30).nullable().optional(),
        location: zod_1.z.string().trim().min(2).max(180).nullable().optional()
    })
        .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update")
});
//# sourceMappingURL=user.schemas.js.map