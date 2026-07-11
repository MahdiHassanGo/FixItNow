import { DayOfWeek } from "@prisma/client";
import assert from "node:assert/strict";
import test from "node:test";
import { assertValidAvailability, localScheduleParts, timeToMinutes } from "../utils/time";

test("HH:mm values convert to minutes", () => {
  assert.equal(timeToMinutes("09:30"), 570);
});

test("overlapping availability is rejected", () => {
  assert.throws(() =>
    assertValidAvailability([
      { dayOfWeek: DayOfWeek.MONDAY, startTime: "09:00", endTime: "12:00" },
      { dayOfWeek: DayOfWeek.MONDAY, startTime: "11:00", endTime: "13:00" }
    ])
  );
});

test("Asia/Dhaka local time is resolved for booking checks", () => {
  const result = localScheduleParts(new Date("2026-07-13T03:00:00.000Z"), "Asia/Dhaka");
  assert.equal(result.day, DayOfWeek.MONDAY);
  assert.equal(result.minutes, 540);
});
