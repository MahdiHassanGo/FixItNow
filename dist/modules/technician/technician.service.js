"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.technicianService = void 0;
const ApiError_1 = require("../../core/ApiError");
const pagination_1 = require("../../core/pagination");
const prisma_1 = require("../../lib/prisma");
const bookingState_1 = require("../../utils/bookingState");
const time_1 = require("../../utils/time");
const profileInclude = {
    user: { select: { id: true, name: true, email: true, phone: true, location: true, activeStatus: true } },
    services: { where: { isActive: true }, include: { category: true }, orderBy: { createdAt: "desc" } },
    availability: { where: { isAvailable: true }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }
};
const list = async (query) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const search = query.search ?? query.searchTerm;
    const conditions = [
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
    if (query.skill)
        conditions.push({ skills: { has: query.skill } });
    if (query.location)
        conditions.push({ location: { contains: query.location, mode: "insensitive" } });
    if (query.categoryId)
        conditions.push({ services: { some: { categoryId: query.categoryId, isActive: true } } });
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
    if (query.minRating !== undefined)
        conditions.push({ rating: { gte: query.minRating } });
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        conditions.push({
            pricePerHour: {
                ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
                ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {})
            }
        });
    }
    const where = { AND: conditions };
    const orderBy = {
        [query.sortBy ?? "rating"]: query.sortOrder ?? "desc"
    };
    const [data, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.technicianProfile.findMany({ where, include: profileInclude, orderBy, skip, take: limit }),
        prisma_1.prisma.technicianProfile.count({ where })
    ]);
    return { data, meta: (0, pagination_1.getPaginationMeta)(page, limit, total) };
};
const getById = async (id) => {
    const profile = await prisma_1.prisma.technicianProfile.findFirst({
        where: { OR: [{ id }, { userId: id }], user: { activeStatus: "ACTIVE" } },
        include: {
            ...profileInclude,
            reviews: {
                include: { customer: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" }
            }
        }
    });
    if (!profile)
        throw new ApiError_1.ApiError(404, "Technician not found");
    return profile;
};
const updateProfile = async (userId, input) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { location: true } });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    const data = input;
    const createData = {
        userId,
        skills: input.skills ?? [],
        bio: input.bio,
        experienceYears: input.experienceYears ?? 0,
        pricePerHour: input.pricePerHour ?? 0,
        location: input.location ?? user.location,
        ...(input.timezone ? { timezone: input.timezone } : {})
    };
    const profile = await prisma_1.prisma.technicianProfile.upsert({
        where: { userId },
        update: data,
        create: createData,
        include: profileInclude
    });
    if (input.location !== undefined) {
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { location: input.location } });
    }
    return profile;
};
const replaceAvailability = async (userId, slots) => {
    (0, time_1.assertValidAvailability)(slots);
    const profile = await prisma_1.prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile)
        throw new ApiError_1.ApiError(404, "Technician profile not found");
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.availability.deleteMany({ where: { technicianId: profile.id } });
        if (slots.length > 0) {
            await tx.availability.createMany({
                data: slots.map((slot) => ({
                    technicianId: profile.id,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isAvailable: slot.isAvailable ?? true
                }))
            });
        }
    });
    return prisma_1.prisma.availability.findMany({
        where: { technicianId: profile.id },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });
};
const listBookings = async (userId) => {
    const profile = await prisma_1.prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile)
        throw new ApiError_1.ApiError(404, "Technician profile not found");
    return prisma_1.prisma.booking.findMany({
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
const changeBookingStatus = async (userId, bookingId, nextStatus) => {
    const profile = await prisma_1.prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile)
        throw new ApiError_1.ApiError(404, "Technician profile not found");
    const booking = await prisma_1.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.technicianId !== profile.id)
        throw new ApiError_1.ApiError(404, "Booking not found for this technician");
    (0, bookingState_1.assertTechnicianTransition)(booking.status, nextStatus);
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { status: nextStatus },
        include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            service: { include: { category: true } },
            payment: true
        }
    });
};
exports.technicianService = { list, getById, updateProfile, replaceAvailability, listBookings, changeBookingStatus };
//# sourceMappingURL=technician.service.js.map