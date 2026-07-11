import { BookingStatus } from "@prisma/client";
import assert from "node:assert/strict";
import test from "node:test";
import { assertTechnicianTransition, canCustomerCancel } from "../utils/bookingState";

test("technician can accept a requested booking", () => {
  assert.doesNotThrow(() => assertTechnicianTransition(BookingStatus.REQUESTED, BookingStatus.ACCEPTED));
});

test("technician cannot start an unpaid booking", () => {
  assert.throws(() => assertTechnicianTransition(BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS));
});

test("customer cancellation stops at in-progress", () => {
  assert.equal(canCustomerCancel(BookingStatus.REQUESTED), true);
  assert.equal(canCustomerCancel(BookingStatus.ACCEPTED), true);
  assert.equal(canCustomerCancel(BookingStatus.PAID), true);
  assert.equal(canCustomerCancel(BookingStatus.IN_PROGRESS), false);
});
