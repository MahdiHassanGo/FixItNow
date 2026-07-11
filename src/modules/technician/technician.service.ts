import { Prisma } from "../../../generated/prisma/client";
import { BookingStatus, DayOfWeek } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { buildMeta, buildPagination } from "../../utils/pagination";

type TechnicianQuery = {
  searchTerm?: string;
  skill?: string;
  location?: string;
  minRating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const getAll = async (query: TechnicianQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = buildPagination(query);
  const andConditions: Prisma.TechnicianProfileWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { bio: { contains: query.searchTerm, mode: "insensitive" } },
        { user: { name: { contains: query.searchTerm, mode: "insensitive" } } }
      ]
    });
  }

  if (query.skill) {
    andConditions.push({ skills: { has: query.skill } });
  }

  if (query.location) {
    andConditions.push({ location: { contains: query.location, mode: "insensitive" } });
  }

  if (query.minRating !== undefined) {
    andConditions.push({ rating: { gte: query.minRating } });
  }

  const where: Prisma.TechnicianProfileWhereInput = andConditions.length ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, location: true, activeStatus: true } },
        services: { where: { isActive: true }, include: { category: true } },
        availability: true
      }
    }),
    prisma.technicianProfile.count({ where })
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getById = async (id: string) => {
  const result = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, location: true, activeStatus: true } },
      services: { where: { isActive: true }, include: { category: true } },
      availability: true,
      reviews: {
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!result) {
    throw new AppError(404, "Technician not found");
  }

  return result;
};

const updateProfile = async (userId: string, payload: Record<string, unknown>) => {
  return prisma.technicianProfile.upsert({
    where: { userId },
    update: payload,
    create: {
      userId,
      skills: Array.isArray(payload.skills) ? payload.skills as string[] : [],
      bio: payload.bio as string | undefined,
      experienceYears: Number(payload.experienceYears || 0),
      pricePerHour: Number(payload.pricePerHour || 0),
      location: payload.location as string | undefined
    }
  });
};

const updateAvailability = async (userId: string, slots: Array<{ dayOfWeek: string; startTime: string; endTime: string; isAvailable?: boolean }>) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(404, "Technician profile not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { technicianId: profile.id } });
    await tx.availability.createMany({
      data: slots.map((slot) => ({
        technicianId: profile.id,
        dayOfWeek: slot.dayOfWeek as DayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable ?? true
      }))
    });
  });

  return prisma.availability.findMany({ where: { technicianId: profile.id }, orderBy: { dayOfWeek: "asc" } });
};

const getMyBookings = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(404, "Technician profile not found");
  }

  return prisma.booking.findMany({
    where: { technicianId: profile.id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      service: true,
      payment: true
    },
    orderBy: { createdAt: "desc" }
  });
};

const updateBookingStatus = async (userId: string, bookingId: string, status: BookingStatus) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(404, "Technician profile not found");
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.technicianId !== profile.id) {
    throw new AppError(404, "Booking not found for this technician");
  }

  if (status === BookingStatus.ACCEPTED && booking.status !== BookingStatus.REQUESTED) {
    throw new AppError(400, "Only requested bookings can be accepted");
  }

  if (status === BookingStatus.DECLINED && booking.status !== BookingStatus.REQUESTED) {
    throw new AppError(400, "Only requested bookings can be declined");
  }

  if (status === BookingStatus.IN_PROGRESS && booking.status !== BookingStatus.PAID) {
    throw new AppError(400, "Only paid bookings can be moved to in-progress");
  }

  if (status === BookingStatus.COMPLETED && booking.status !== BookingStatus.IN_PROGRESS) {
    throw new AppError(400, "Only in-progress bookings can be completed");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { service: true, payment: true, customer: { select: { id: true, name: true, email: true } } }
  });
};

export const technicianService = {
  getAll,
  getById,
  updateProfile,
  updateAvailability,
  getMyBookings,
  updateBookingStatus
};
