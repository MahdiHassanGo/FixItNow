"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const time_1 = require("../utils/time");
(0, node_test_1.default)("HH:mm values convert to minutes", () => {
    strict_1.default.equal((0, time_1.timeToMinutes)("09:30"), 570);
});
(0, node_test_1.default)("overlapping availability is rejected", () => {
    strict_1.default.throws(() => (0, time_1.assertValidAvailability)([
        { dayOfWeek: client_1.DayOfWeek.MONDAY, startTime: "09:00", endTime: "12:00" },
        { dayOfWeek: client_1.DayOfWeek.MONDAY, startTime: "11:00", endTime: "13:00" }
    ]));
});
(0, node_test_1.default)("Asia/Dhaka local time is resolved for booking checks", () => {
    const result = (0, time_1.localScheduleParts)(new Date("2026-07-13T03:00:00.000Z"), "Asia/Dhaka");
    strict_1.default.equal(result.day, client_1.DayOfWeek.MONDAY);
    strict_1.default.equal(result.minutes, 540);
});
//# sourceMappingURL=time.test.js.map