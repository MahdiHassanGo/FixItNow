"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.technicianReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        bookingId: zod_1.z.string().uuid(),
        rating: zod_1.z.coerce.number().int().min(1).max(5),
        comment: zod_1.z.string().trim().max(2000).optional()
    })
});
exports.technicianReviewSchema = zod_1.z.object({
    params: zod_1.z.object({ technicianId: zod_1.z.string().uuid() })
});
//# sourceMappingURL=review.schemas.js.map