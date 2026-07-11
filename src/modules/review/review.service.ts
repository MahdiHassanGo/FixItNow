import { BookingStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

const create = async (customerId: string, payload: { bookingId: string; rating: number; comment?: string }) => {
  const booking = await prisma.booking.findUnique({ where: { id: payload.bookingId } });
  if (!booking || booking.customerId !== customerId) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(400, "Review is allowed only after job completion");
  }

  const existingReview = await prisma.review.findUnique({ where: { bookingId: booking.id } });
  if (existingReview) {
    throw new AppError(400, "Review already exists for this booking");
  }

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId,
      technicianId: booking.technicianId,
      rating: payload.rating,
      comment: payload.comment
    },
    include: { customer: { select: { id: true, name: true } } }
  });

  const stats = await prisma.review.aggregate({
    where: { technicianId: booking.technicianId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await prisma.technicianProfile.update({
    where: { id: booking.technicianId },
    data: {
      rating: Number(stats._avg.rating || 0),
      totalReviews: stats._count.rating
    }
  });

  return review;
};

const getTechnicianReviews = async (technicianId: string) => {
  return prisma.review.findMany({
    where: { technicianId },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });
};

export const reviewService = {
  create,
  getTechnicianReviews
};
