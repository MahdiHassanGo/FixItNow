import { Role, BookingStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

const bookingInclude = {
  service: { include: { category: true } },
  technician: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
  customer: { select: { id: true, name: true, email: true, phone: true } },
  payment: true,
  review: true
};

const create = async (
  customerId: string,
  payload: { serviceId: string; scheduledAt: Date; address: string; note?: string }
) => {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
    include: { technician: true }
  });

  if (!service || !service.isActive) {
    throw new AppError(404, "Service not found");
  }

  if (service.technician.userId === customerId) {
    throw new AppError(400, "You cannot book your own service");
  }

  return prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId: service.id,
      scheduledAt: payload.scheduledAt,
      address: payload.address,
      note: payload.note,
      totalAmount: service.price
    },
    include: bookingInclude
  });
};

const getMyBookings = async (userId: string, role: Role) => {
  if (role === Role.ADMIN) {
    return prisma.booking.findMany({
      include: bookingInclude,
      orderBy: { createdAt: "desc" }
    });
  }

  return prisma.booking.findMany({
    where: { customerId: userId },
    include: bookingInclude,
    orderBy: { createdAt: "desc" }
  });
};

const getById = async (userId: string, role: Role, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: bookingInclude
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (role === Role.ADMIN || booking.customerId === userId || booking.technician.userId === userId) {
    return booking;
  }

  throw new AppError(403, "You do not have permission to view this booking");
};

const cancel = async (userId: string, role: Role, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (role !== Role.ADMIN && booking.customerId !== userId) {
    throw new AppError(403, "You can cancel only your own booking");
  }

  const nonCancellableStatuses: BookingStatus[] = [
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED
  ];

  if (nonCancellableStatuses.includes(booking.status)) {
    throw new AppError(400, "This booking cannot be cancelled now");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
    include: bookingInclude
  });
};

export const bookingService = {
  create,
  getMyBookings,
  getById,
  cancel
};