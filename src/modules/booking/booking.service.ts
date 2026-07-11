import { BookingStatus, Prisma, Role } from "@prisma/client";
import { ApiError } from "../../core/ApiError";
import { prisma } from "../../lib/prisma";
import { canCustomerCancel } from "../../utils/bookingState";
import { localScheduleParts, timeToMinutes } from "../../utils/time";

type CreateBookingInput = {
  serviceId: string;
  scheduledAt: Date;
  address: string;
  note?: string;
};

const bookingInclude = {
  customer: { select: { id: true, name: true, email: true, phone: true, location: true } },
  technician: {
    include: { user: { select: { id: true, name: true, email: true, phone: true, location: true } } }
  },
  service: { include: { category: true } },
  payment: true,
  review: true
} satisfies Prisma.BookingInclude;

const create = async (customerId: string, input: CreateBookingInput) => {
  if (input.scheduledAt.getTime() <= Date.now()) throw new ApiError(400, "Booking time must be in the future");

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, isActive: true },
    include: {
      technician: {
        include: {
          user: { select: { id: true, activeStatus: true } },
          availability: { where: { isAvailable: true } }
        }
      }
    }
  });

  if (!service || service.technician.user.activeStatus !== "ACTIVE") throw new ApiError(404, "Service is not available");
  if (service.technician.userId === customerId) throw new ApiError(400, "You cannot book your own service");

  const timeZone = (service.technician as typeof service.technician & { timezone?: string }).timezone ?? "Asia/Dhaka";
  const local = localScheduleParts(input.scheduledAt, timeZone);
  const available = service.technician.availability.some(
    (slot) =>
      slot.dayOfWeek === local.day &&
      local.minutes >= timeToMinutes(slot.startTime) &&
      local.minutes < timeToMinutes(slot.endTime)
  );
  if (!available) throw new ApiError(409, "The technician is not available at the requested time");

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      technicianId: service.technicianId,
      scheduledAt: input.scheduledAt,
      status: { in: [BookingStatus.REQUESTED, BookingStatus.ACCEPTED, BookingStatus.PAID, BookingStatus.IN_PROGRESS] }
    }
  });
  if (conflictingBooking) throw new ApiError(409, "That time slot has already been booked");

  return prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId: service.id,
      scheduledAt: input.scheduledAt,
      address: input.address,
      note: input.note,
      totalAmount: service.price
    },
    include: bookingInclude
  });
};

const listForUser = async (userId: string, role: Role) => {
  const where: Prisma.BookingWhereInput =
    role === Role.ADMIN
      ? {}
      : role === Role.TECHNICIAN
        ? { technician: { userId } }
        : { customerId: userId };

  return prisma.booking.findMany({ where, include: bookingInclude, orderBy: { createdAt: "desc" } });
};

const getById = async (userId: string, role: Role, bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
  if (!booking) throw new ApiError(404, "Booking not found");

  const canView =
    role === Role.ADMIN || booking.customerId === userId || booking.technician.userId === userId;
  if (!canView) throw new ApiError(403, "You cannot view this booking");
  return booking;
};

const cancel = async (userId: string, role: Role, bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (role !== Role.ADMIN && booking.customerId !== userId) {
    throw new ApiError(403, "Customers may cancel only their own bookings");
  }
  if (!canCustomerCancel(booking.status)) {
    throw new ApiError(400, `A ${booking.status} booking cannot be cancelled`);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
    include: bookingInclude
  });
};

export const bookingService = { create, listForUser, getById, cancel };
