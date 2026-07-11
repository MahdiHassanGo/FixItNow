import { ActiveStatus, Prisma, Role } from "@prisma/client";
import { ApiError } from "../../core/ApiError";
import { getPagination, getPaginationMeta } from "../../core/pagination";
import { prisma } from "../../lib/prisma";
import { publicUserSelect } from "../../utils/userSelect";

type UserQuery = {
  role?: Role;
  activeStatus?: ActiveStatus;
  search?: string;
  page?: number;
  limit?: number;
};

const listUsers = async (query: UserQuery) => {
  const { page, limit, skip } = getPagination(query);
  const where: Prisma.UserWhereInput = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.activeStatus ? { activeStatus: query.activeStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
            { location: { contains: query.search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: { ...publicUserSelect, technicianProfile: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return { data, meta: getPaginationMeta(page, limit, total) };
};

const updateUserStatus = async (adminId: string, userId: string, status: ActiveStatus) => {
  if (adminId === userId && status === ActiveStatus.BLOCKED) {
    throw new ApiError(400, "Administrators cannot block their own account");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { activeStatus: status },
    select: publicUserSelect
  });
};

const listBookings = () =>
  prisma.booking.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
      service: { include: { category: true } },
      payment: true,
      review: true
    },
    orderBy: { createdAt: "desc" }
  });

const listPayments = () =>
  prisma.payment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      booking: { include: { service: true } }
    },
    orderBy: { createdAt: "desc" }
  });

export const adminService = { listUsers, updateUserStatus, listBookings, listPayments };
