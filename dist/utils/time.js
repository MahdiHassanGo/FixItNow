"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidAvailability = exports.localScheduleParts = exports.timeToMinutes = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../core/ApiError");
const weekdayMap = {
    Saturday: client_1.DayOfWeek.SATURDAY,
    Sunday: client_1.DayOfWeek.SUNDAY,
    Monday: client_1.DayOfWeek.MONDAY,
    Tuesday: client_1.DayOfWeek.TUESDAY,
    Wednesday: client_1.DayOfWeek.WEDNESDAY,
    Thursday: client_1.DayOfWeek.THURSDAY,
    Friday: client_1.DayOfWeek.FRIDAY
};
const timeToMinutes = (time) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        throw new ApiError_1.ApiError(400, `Invalid time value: ${time}. Use HH:mm.`);
    }
    const [hours, minutes] = time.split(":").map(Number);
    return (hours ?? 0) * 60 + (minutes ?? 0);
};
exports.timeToMinutes = timeToMinutes;
const localScheduleParts = (date, timeZone) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    });
    const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
    const day = weekdayMap[parts.weekday ?? ""];
    if (!day) {
        throw new ApiError_1.ApiError(400, `Unsupported timezone or weekday for ${timeZone}`);
    }
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    return { day, minutes };
};
exports.localScheduleParts = localScheduleParts;
const assertValidAvailability = (slots) => {
    const byDay = new Map();
    for (const slot of slots) {
        const start = (0, exports.timeToMinutes)(slot.startTime);
        const end = (0, exports.timeToMinutes)(slot.endTime);
        if (start >= end) {
            throw new ApiError_1.ApiError(400, `${slot.dayOfWeek}: endTime must be later than startTime`);
        }
        const daySlots = byDay.get(slot.dayOfWeek) ?? [];
        if (daySlots.some((existing) => start < existing.end && end > existing.start)) {
            throw new ApiError_1.ApiError(400, `${slot.dayOfWeek}: availability slots cannot overlap`);
        }
        daySlots.push({ start, end });
        byDay.set(slot.dayOfWeek, daySlots);
    }
};
exports.assertValidAvailability = assertValidAvailability;
//# sourceMappingURL=time.js.map