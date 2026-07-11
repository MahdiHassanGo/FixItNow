"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canCustomerCancel = exports.assertTechnicianTransition = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../core/ApiError");
const technicianTransitions = {
    [client_1.BookingStatus.REQUESTED]: [client_1.BookingStatus.ACCEPTED, client_1.BookingStatus.DECLINED],
    [client_1.BookingStatus.PAID]: [client_1.BookingStatus.IN_PROGRESS],
    [client_1.BookingStatus.IN_PROGRESS]: [client_1.BookingStatus.COMPLETED]
};
const assertTechnicianTransition = (from, to) => {
    const allowed = technicianTransitions[from] ?? [];
    if (!allowed.includes(to)) {
        throw new ApiError_1.ApiError(400, `Booking cannot move from ${from} to ${to}`);
    }
};
exports.assertTechnicianTransition = assertTechnicianTransition;
const canCustomerCancel = (status) => status === client_1.BookingStatus.REQUESTED || status === client_1.BookingStatus.ACCEPTED || status === client_1.BookingStatus.PAID;
exports.canCustomerCancel = canCustomerCancel;
//# sourceMappingURL=bookingState.js.map