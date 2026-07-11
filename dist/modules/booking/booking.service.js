"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../../core/ApiError");
const prisma_1 = require("../../lib/prisma");
const bookingState_1 = require("../../utils/bookingState");
const time_1 = require("../../utils/time");
const bookingInclude = {
    customer: { select: { id: true, name: true, email: true, phone: true, location: true } },
    technician: {
        include: { user: { select: { id: true, name: true, email: true, phone: true, location: true } } }
    },
    service: { include: { category: true } },
    payment: true,
    review: true
};
const create = async (customerId, input) => {
    if (input.scheduledAt.getTime() <= Date.now())
        throw new ApiError_1.ApiError(400, "Booking time must be in the future");
    const service = await prisma_1.prisma.service.findFirst({
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
    if (!service || service.technician.user.activeStatus !== "ACTIVE")
        throw new ApiError_1.ApiError(404, "Service is not available");
    if (service.technician.userId === customerId)
        throw new ApiError_1.ApiError(400, "You cannot book your own service");
    const timeZone = service.technician.timezone ?? "Asia/Dhaka";
    const local = (0, time_1.localScheduleParts)(input.scheduledAt, timeZone);
    const available = service.technician.availability.some((slot) => slot.dayOfWeek === local.day &&
        local.minutes >= (0, time_1.timeToMinutes)(slot.startTime) &&
        local.minutes < (0, time_1.timeToMinutes)(slot.endTime));
    if (!available)
        throw new ApiError_1.ApiError(409, "The technician is not available at the requested time");
    const conflictingBooking = await prisma_1.prisma.booking.findFirst({
        where: {
            technicianId: service.technicianId,
            scheduledAt: input.scheduledAt,
            status: { in: [client_1.BookingStatus.REQUESTED, client_1.BookingStatus.ACCEPTED, client_1.BookingStatus.PAID, client_1.BookingStatus.IN_PROGRESS] }
        }
    });
    if (conflictingBooking)
        throw new ApiError_1.ApiError(409, "That time slot has already been booked");
    return prisma_1.prisma.booking.create({
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
const listForUser = async (userId, role) => {
    const where = role === client_1.Role.ADMIN
        ? {}
        : role === client_1.Role.TECHNICIAN
            ? { technician: { userId } }
            : { customerId: userId };
    return prisma_1.prisma.booking.findMany({ where, include: bookingInclude, orderBy: { createdAt: "desc" } });
};
const getById = async (userId, role, bookingId) => {
    const booking = await prisma_1.prisma.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
    if (!booking)
        throw new ApiError_1.ApiError(404, "Booking not found");
    const canView = role === client_1.Role.ADMIN || booking.customerId === userId || booking.technician.userId === userId;
    if (!canView)
        throw new ApiError_1.ApiError(403, "You cannot view this booking");
    return booking;
};
const cancel = async (userId, role, bookingId) => {
    const booking = await prisma_1.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking)
        throw new ApiError_1.ApiError(404, "Booking not found");
    if (role !== client_1.Role.ADMIN && booking.customerId !== userId) {
        throw new ApiError_1.ApiError(403, "Customers may cancel only their own bookings");
    }
    if (!(0, bookingState_1.canCustomerCancel)(booking.status)) {
        throw new ApiError_1.ApiError(400, `A ${booking.status} booking cannot be cancelled`);
    }
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { status: client_1.BookingStatus.CANCELLED },
        include: bookingInclude
    });
};
exports.bookingService = { create, listForUser, getById, cancel };
//# sourceMappingURL=booking.service.js.map