"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../../core/ApiError");
const prisma_1 = require("../../lib/prisma");
const create = async (customerId, input) => {
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { review: true }
    });
    if (!booking || booking.customerId !== customerId)
        throw new ApiError_1.ApiError(404, "Completed booking not found");
    if (booking.status !== client_1.BookingStatus.COMPLETED)
        throw new ApiError_1.ApiError(400, "Reviews are allowed only after job completion");
    if (booking.review)
        throw new ApiError_1.ApiError(409, "This booking has already been reviewed");
    return prisma_1.prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                bookingId: booking.id,
                customerId,
                technicianId: booking.technicianId,
                rating: input.rating,
                comment: input.comment
            },
            include: { customer: { select: { id: true, name: true } } }
        });
        const summary = await tx.review.aggregate({
            where: { technicianId: booking.technicianId },
            _avg: { rating: true },
            _count: { rating: true }
        });
        await tx.technicianProfile.update({
            where: { id: booking.technicianId },
            data: {
                rating: summary._avg.rating ?? 0,
                totalReviews: summary._count.rating
            }
        });
        return review;
    });
};
const listForTechnician = async (technicianId) => {
    const profile = await prisma_1.prisma.technicianProfile.findFirst({ where: { OR: [{ id: technicianId }, { userId: technicianId }] } });
    if (!profile)
        throw new ApiError_1.ApiError(404, "Technician not found");
    return prisma_1.prisma.review.findMany({
        where: { technicianId: profile.id },
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
    });
};
exports.reviewService = { create, listForTechnician };
//# sourceMappingURL=review.service.js.map