"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const bookingState_1 = require("../utils/bookingState");
(0, node_test_1.default)("technician can accept a requested booking", () => {
    strict_1.default.doesNotThrow(() => (0, bookingState_1.assertTechnicianTransition)(client_1.BookingStatus.REQUESTED, client_1.BookingStatus.ACCEPTED));
});
(0, node_test_1.default)("technician cannot start an unpaid booking", () => {
    strict_1.default.throws(() => (0, bookingState_1.assertTechnicianTransition)(client_1.BookingStatus.ACCEPTED, client_1.BookingStatus.IN_PROGRESS));
});
(0, node_test_1.default)("customer cancellation stops at in-progress", () => {
    strict_1.default.equal((0, bookingState_1.canCustomerCancel)(client_1.BookingStatus.REQUESTED), true);
    strict_1.default.equal((0, bookingState_1.canCustomerCancel)(client_1.BookingStatus.ACCEPTED), true);
    strict_1.default.equal((0, bookingState_1.canCustomerCancel)(client_1.BookingStatus.PAID), true);
    strict_1.default.equal((0, bookingState_1.canCustomerCancel)(client_1.BookingStatus.IN_PROGRESS), false);
});
//# sourceMappingURL=bookingState.test.js.map