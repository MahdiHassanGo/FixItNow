import { BookingStatus } from "@prisma/client";
import { ApiError } from "../core/ApiError";

const technicianTransitions: Partial<Record<BookingStatus, readonly BookingStatus[]>> = {
  [BookingStatus.REQUESTED]: [BookingStatus.ACCEPTED, BookingStatus.DECLINED],
  [BookingStatus.PAID]: [BookingStatus.IN_PROGRESS],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED]
};

export const assertTechnicianTransition = (from: BookingStatus, to: BookingStatus): void => {
  const allowed = technicianTransitions[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ApiError(400, `Booking cannot move from ${from} to ${to}`);
  }
};

export const canCustomerCancel = (status: BookingStatus): boolean =>
  status === BookingStatus.REQUESTED || status === BookingStatus.ACCEPTED || status === BookingStatus.PAID;
