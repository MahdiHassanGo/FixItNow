import { BookingStatus } from "@prisma/client";
import { ApiError } from "../../core/ApiError";
import { prisma } from "../../lib/prisma";

type ReviewInput = { bookingId: string; rating: number; comment?: string };

const create = async (customerId: string, input: ReviewInput) => {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { review: true }
  });

  if (!booking || booking.customerId !== customerId) throw new ApiError(404, "Completed booking not found");
  if (booking.status !== BookingStatus.COMPLETED) throw new ApiError(400, "Reviews are allowed only after job completion");
  if (booking.review) throw new ApiError(409, "This booking has already been reviewed");

  return prisma.$transaction(async (tx) => {
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

const listForTechnician = async (technicianId: string) => {
  const profile = await prisma.technicianProfile.findFirst({ where: { OR: [{ id: technicianId }, { userId: technicianId }] } });
  if (!profile) throw new ApiError(404, "Technician not found");

  return prisma.review.findMany({
    where: { technicianId: profile.id },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });
};

export const reviewService = { create, listForTechnician };
