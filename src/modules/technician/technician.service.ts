import { BookingStatus, DayOfWeek, Prisma } from "@prisma/client";
import { ApiError } from "../../core/ApiError";
import { getPagination, getPaginationMeta } from "../../core/pagination";
import { prisma } from "../../lib/prisma";
import { assertTechnicianTransition } from "../../utils/bookingState";
import { assertValidAvailability, type AvailabilitySlotInput } from "../../utils/time";

type TechnicianQuery = {
  search?: string;
  searchTerm?: string;
  skill?: string;
  location?: string;
  categoryId?: string;
  serviceType?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "rating" | "totalReviews" | "experienceYears" | "pricePerHour";
  sortOrder?: "asc" | "desc";
};

type ProfileInput = {
  bio?: string | null;
  skills?: string[];
  experienceYears?: number;
  pricePerHour?: number;
  location?: string | null;
  timezone?: string;
};

const profileInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, location: true, activeStatus: true } },
  services: { where: { isActive: true }, include: { category: true }, orderBy: { createdAt: "desc" as const } },
  availability: { where: { isAvailable: true }, orderBy: [{ dayOfWeek: "asc" as const }, { startTime: "asc" as const }] }
} satisfies Prisma.TechnicianProfileInclude;

const list = async (query: TechnicianQuery) => {
  const { page, limit, skip } = getPagination(query);
  const search = query.search ?? query.searchTerm;
  const conditions: Prisma.TechnicianProfileWhereInput[] = [
    { user: { activeStatus: "ACTIVE" } }
  ];

  if (search) {
    conditions.push({
      OR: [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { bio: { contains: search, mode: "insensitive" } },
        { services: { some: { title: { contains: search, mode: "insensitive" }, isActive: true } } }
      ]
    });
  }
  if (query.skill) conditions.push({ skills: { has: query.skill } });
  if (query.location) conditions.push({ location: { contains: query.location, mode: "insensitive" } });
  if (query.categoryId) conditions.push({ services: { some: { categoryId: query.categoryId, isActive: true } } });
  if (query.serviceType) {
    conditions.push({
      services: {
        some: {
          isActive: true,
          category: { name: { contains: query.serviceType, mode: "insensitive" } }
        }
      }
    });
  }
  if (query.minRating !== undefined) conditions.push({ rating: { gte: query.minRating } });
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    conditions.push({
      pricePerHour: {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {})
      }
    });
  }

  const where: Prisma.TechnicianProfileWhereInput = { AND: conditions };

  const orderBy: Prisma.TechnicianProfileOrderByWithRelationInput = {
    [query.sortBy ?? "rating"]: query.sortOrder ?? "desc"
  };

  const [data, total] = await prisma.$transaction([
    prisma.technicianProfile.findMany({ where, include: profileInclude, orderBy, skip, take: limit }),
    prisma.technicianProfile.count({ where })
  ]);

  return { data, meta: getPaginationMeta(page, limit, total) };
};

const getById = async (id: string) => {
  const profile = await prisma.technicianProfile.findFirst({
    where: { OR: [{ id }, { userId: id }], user: { activeStatus: "ACTIVE" } },
    include: {
      ...profileInclude,
      reviews: {
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!profile) throw new ApiError(404, "Technician not found");
  return profile;
};

const updateProfile = async (userId: string, input: ProfileInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { location: true } });
  if (!user) throw new ApiError(404, "User not found");

  const data = input as Prisma.TechnicianProfileUncheckedUpdateInput;
  const createData = {
    userId,
    skills: input.skills ?? [],
    bio: input.bio,
    experienceYears: input.experienceYears ?? 0,
    pricePerHour: input.pricePerHour ?? 0,
    location: input.location ?? user.location,
    ...(input.timezone ? { timezone: input.timezone } : {})
  } as unknown as Prisma.TechnicianProfileUncheckedCreateInput;

  const profile = await prisma.technicianProfile.upsert({
    where: { userId },
    update: data,
    create: createData,
    include: profileInclude
  });

  if (input.location !== undefined) {
    await prisma.user.update({ where: { id: userId }, data: { location: input.location } });
  }
  return profile;
};

const replaceAvailability = async (userId: string, slots: AvailabilitySlotInput[]) => {
  assertValidAvailability(slots);
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");

  await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { technicianId: profile.id } });
    if (slots.length > 0) {
      await tx.availability.createMany({
        data: slots.map((slot) => ({
          technicianId: profile.id,
          dayOfWeek: slot.dayOfWeek as DayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable ?? true
        }))
      });
    }
  });

  return prisma.availability.findMany({
    where: { technicianId: profile.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
  });
};

const listBookings = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");
  return prisma.booking.findMany({
    where: { technicianId: profile.id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      service: { include: { category: true } },
      payment: true,
      review: true
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }]
  });
};

const changeBookingStatus = async (userId: string, bookingId: string, nextStatus: BookingStatus) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.technicianId !== profile.id) throw new ApiError(404, "Booking not found for this technician");

  assertTechnicianTransition(booking.status, nextStatus);

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: nextStatus },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      service: { include: { category: true } },
      payment: true
    }
  });
};

export const technicianService = { list, getById, updateProfile, replaceAvailability, listBookings, changeBookingStatus };
