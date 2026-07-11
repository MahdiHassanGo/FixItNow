"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserQuerySchema = exports.userStatusSchema = void 0;
const zod_1 = require("zod");
exports.userStatusSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({ activeStatus: zod_1.z.enum(["ACTIVE", "BLOCKED"]) })
});
exports.adminUserQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        role: zod_1.z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]).optional(),
        activeStatus: zod_1.z.enum(["ACTIVE", "BLOCKED"]).optional(),
        search: zod_1.z.string().trim().optional(),
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional()
    })
});
//# sourceMappingURL=admin.schemas.js.map