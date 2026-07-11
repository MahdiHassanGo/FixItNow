"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceService = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../../core/ApiError");
const pagination_1 = require("../../core/pagination");
const prisma_1 = require("../../lib/prisma");
const detailsInclude = {
    category: true,
    technician: {
        include: {
            user: { select: { id: true, name: true, email: true, phone: true, location: true } }
        }
    }
};
const ensureCategory = async (categoryId) => {
    const category = await prisma_1.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category)
        throw new ApiError_1.ApiError(404, "Category not found");
};
const create = async (technicianUserId, input) => {
    const profile = await prisma_1.prisma.technicianProfile.findUnique({ where: { userId: technicianUserId } });
    if (!profile)
        throw new ApiError_1.ApiError(404, "Technician profile not found");
    await ensureCategory(input.categoryId);
    return prisma_1.prisma.service.create({
        data: {
            title: input.title,
            description: input.description,
            price: input.price,
            location: input.location ?? profile.location,
            categoryId: input.categoryId,
            technicianId: profile.id
        },
        include: detailsInclude
    });
};
const list = async (query) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const search = query.search ?? query.searchTerm;
    const where = {
        isActive: true,
        technician: { user: { activeStatus: "ACTIVE" } },
        ...(search
            ? {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                    { technician: { user: { name: { contains: search, mode: "insensitive" } } } }
                ]
            }
            : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.type ? { category: { name: { contains: query.type, mode: "insensitive" } } } : {}),
        ...(query.location ? { location: { contains: query.location, mode: "insensitive" } } : {}),
        ...(query.minRating !== undefined ? { technician: { rating: { gte: query.minRating }, user: { activeStatus: "ACTIVE" } } } : {}),
        ...(query.technicianId ? { technicianId: query.technicianId } : {}),
        ...(query.minPrice !== undefined || query.maxPrice !== undefined
            ? { price: { ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}), ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}) } }
            : {})
    };
    const direction = query.sortOrder ?? "desc";
    const orderBy = query.sortBy === "rating"
        ? { technician: { rating: direction } }
        : { [query.sortBy ?? "createdAt"]: direction };
    const [data, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.service.findMany({ where, include: detailsInclude, orderBy, skip, take: limit }),
        prisma_1.prisma.service.count({ where })
    ]);
    return { data, meta: (0, pagination_1.getPaginationMeta)(page, limit, total) };
};
const getById = async (id) => {
    const service = await prisma_1.prisma.service.findFirst({
        where: { id, isActive: true, technician: { user: { activeStatus: "ACTIVE" } } },
        include: detailsInclude
    });
    if (!service)
        throw new ApiError_1.ApiError(404, "Service not found");
    return service;
};
const listMine = async (technicianUserId) => {
    const profile = await prisma_1.prisma.technicianProfile.findUnique({ where: { userId: technicianUserId } });
    if (!profile)
        throw new ApiError_1.ApiError(404, "Technician profile not found");
    return prisma_1.prisma.service.findMany({ where: { technicianId: profile.id }, include: detailsInclude, orderBy: { createdAt: "desc" } });
};
const update = async (actorId, actorRole, serviceId, input) => {
    const service = await prisma_1.prisma.service.findUnique({ where: { id: serviceId }, include: { technician: true } });
    if (!service)
        throw new ApiError_1.ApiError(404, "Service not found");
    if (actorRole !== client_1.Role.ADMIN && service.technician.userId !== actorId) {
        throw new ApiError_1.ApiError(403, "Technicians may update only their own services");
    }
    if (input.categoryId)
        await ensureCategory(input.categoryId);
    return prisma_1.prisma.service.update({ where: { id: serviceId }, data: input, include: detailsInclude });
};
const archive = async (actorId, actorRole, serviceId) => {
    const service = await prisma_1.prisma.service.findUnique({ where: { id: serviceId }, include: { technician: true } });
    if (!service)
        throw new ApiError_1.ApiError(404, "Service not found");
    if (actorRole !== client_1.Role.ADMIN && service.technician.userId !== actorId) {
        throw new ApiError_1.ApiError(403, "Technicians may remove only their own services");
    }
    return prisma_1.prisma.service.update({ where: { id: serviceId }, data: { isActive: false }, include: detailsInclude });
};
exports.serviceService = { create, list, getById, listMine, update, archive };
//# sourceMappingURL=service.service.js.map