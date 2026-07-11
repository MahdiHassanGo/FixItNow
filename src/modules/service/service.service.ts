import { Prisma, Role } from "@prisma/client";
import { ApiError } from "../../core/ApiError";
import { getPagination, getPaginationMeta } from "../../core/pagination";
import { prisma } from "../../lib/prisma";

type ServiceQuery = {
  search?: string;
  searchTerm?: string;
  categoryId?: string;
  type?: string;
  location?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  technicianId?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "price" | "title" | "rating";
  sortOrder?: "asc" | "desc";
};

type ServiceInput = {
  title?: string;
  description?: string;
  price?: number;
  location?: string | null;
  categoryId?: string;
  isActive?: boolean;
};

const detailsInclude = {
  category: true,
  technician: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, location: true } }
    }
  }
} satisfies Prisma.ServiceInclude;

const ensureCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new ApiError(404, "Category not found");
};

const create = async (technicianUserId: string, input: Required<Pick<ServiceInput, "title" | "description" | "price" | "categoryId">> & ServiceInput) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId: technicianUserId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");
  await ensureCategory(input.categoryId);

  return prisma.service.create({
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

const list = async (query: ServiceQuery) => {
  const { page, limit, skip } = getPagination(query);
  const search = query.search ?? query.searchTerm;
  const where: Prisma.ServiceWhereInput = {
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
  const orderBy: Prisma.ServiceOrderByWithRelationInput =
    query.sortBy === "rating"
      ? { technician: { rating: direction } }
      : { [query.sortBy ?? "createdAt"]: direction };

  const [data, total] = await prisma.$transaction([
    prisma.service.findMany({ where, include: detailsInclude, orderBy, skip, take: limit }),
    prisma.service.count({ where })
  ]);

  return { data, meta: getPaginationMeta(page, limit, total) };
};

const getById = async (id: string) => {
  const service = await prisma.service.findFirst({
    where: { id, isActive: true, technician: { user: { activeStatus: "ACTIVE" } } },
    include: detailsInclude
  });
  if (!service) throw new ApiError(404, "Service not found");
  return service;
};

const listMine = async (technicianUserId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId: technicianUserId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");
  return prisma.service.findMany({ where: { technicianId: profile.id }, include: detailsInclude, orderBy: { createdAt: "desc" } });
};

const update = async (actorId: string, actorRole: Role, serviceId: string, input: ServiceInput) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId }, include: { technician: true } });
  if (!service) throw new ApiError(404, "Service not found");
  if (actorRole !== Role.ADMIN && service.technician.userId !== actorId) {
    throw new ApiError(403, "Technicians may update only their own services");
  }
  if (input.categoryId) await ensureCategory(input.categoryId);
  return prisma.service.update({ where: { id: serviceId }, data: input, include: detailsInclude });
};

const archive = async (actorId: string, actorRole: Role, serviceId: string) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId }, include: { technician: true } });
  if (!service) throw new ApiError(404, "Service not found");
  if (actorRole !== Role.ADMIN && service.technician.userId !== actorId) {
    throw new ApiError(403, "Technicians may remove only their own services");
  }
  return prisma.service.update({ where: { id: serviceId }, data: { isActive: false }, include: detailsInclude });
};

export const serviceService = { create, list, getById, listMine, update, archive };
