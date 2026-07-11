"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const password = zod_1.z.string().min(8).max(72).regex(/[A-Za-z]/, "Password must contain a letter").regex(/\d/, "Password must contain a number");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(2).max(120),
        email: zod_1.z.string().trim().toLowerCase().email(),
        password,
        phone: zod_1.z.string().trim().min(6).max(30).optional(),
        location: zod_1.z.string().trim().min(2).max(180).optional(),
        role: zod_1.z.enum(["CUSTOMER", "TECHNICIAN"])
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().trim().toLowerCase().email(),
        password: zod_1.z.string().min(1)
    })
});
exports.refreshSchema = zod_1.z.object({
    body: zod_1.z.object({ refreshToken: zod_1.z.string().optional() }).optional()
});
//# sourceMappingURL=auth.schemas.js.map