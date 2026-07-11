import { Prisma } from "../../../generated/prisma/client";
import { Role } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { buildMeta, buildPagination } from "../../utils/pagination";

type ServiceQuery = {
  searchTerm?: string;
  categoryId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const serviceInclude = {
  category: true,
  technician: {
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, location: true }
      }
    }
  }
};

const create = async (userId: string, payload: { title: string; description: string; price: number; location?: string; categoryId: string }) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(404, "Technician profile not found");
  }

  return prisma.service.create({
    data: {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      location: payload.location || profile.location,
      categoryId: payload.categoryId,
      technicianId: profile.id
    },
    include: serviceInclude
  });
};

const getAll = async (query: ServiceQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = buildPagination(query);
  const andConditions: Prisma.ServiceWhereInput[] = [{ isActive: true }];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } }
      ]
    });
  }

  if (query.categoryId) {
    andConditions.push({ categoryId: query.categoryId });
  }

  if (query.location) {
    andConditions.push({ location: { contains: query.location, mode: "insensitive" } });
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (query.minPrice !== undefined) {
      priceFilter.gte = query.minPrice;
    }
    if (query.maxPrice !== undefined) {
      priceFilter.lte = query.maxPrice;
    }
    andConditions.push({ price: priceFilter });
  }

  const where: Prisma.ServiceWhereInput = { AND: andConditions };

  const [data, total] = await Promise.all([
    prisma.service.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder }, include: serviceInclude }),
    prisma.service.count({ where })
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getById = async (id: string) => {
  const result = await prisma.service.findUnique({ where: { id }, include: serviceInclude });
  if (!result || !result.isActive) {
    throw new AppError(404, "Service not found");
  }
  return result;
};

const update = async (userId: string, userRole: Role, id: string, payload: Record<string, unknown>) => {
  const service = await prisma.service.findUnique({ where: { id }, include: { technician: true } });
  if (!service) {
    throw new AppError(404, "Service not found");
  }

  if (userRole !== Role.ADMIN && service.technician.userId !== userId) {
    throw new AppError(403, "You can update only your own service");
  }

  return prisma.service.update({ where: { id }, data: payload, include: serviceInclude });
};

const remove = async (userId: string, userRole: Role, id: string) => {
  const service = await prisma.service.findUnique({ where: { id }, include: { technician: true } });
  if (!service) {
    throw new AppError(404, "Service not found");
  }

  if (userRole !== Role.ADMIN && service.technician.userId !== userId) {
    throw new AppError(403, "You can delete only your own service");
  }

  return prisma.service.update({ where: { id }, data: { isActive: false }, include: serviceInclude });
};

const getMyServices = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(404, "Technician profile not found");
  }
  return prisma.service.findMany({ where: { technicianId: profile.id }, include: serviceInclude, orderBy: { createdAt: "desc" } });
};

export const serviceService = {
  create,
  getAll,
  getById,
  update,
  remove,
  getMyServices
};
