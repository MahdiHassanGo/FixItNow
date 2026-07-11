"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = exports.bookingIdSchema = void 0;
const zod_1 = require("zod");
exports.bookingIdSchema = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string().uuid() }) });
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        serviceId: zod_1.z.string().uuid(),
        scheduledAt: zod_1.z.coerce.date(),
        address: zod_1.z.string().trim().min(5).max(500),
        note: zod_1.z.string().trim().max(1500).optional()
    })
});
//# sourceMappingURL=booking.schemas.js.map