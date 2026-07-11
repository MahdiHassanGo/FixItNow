import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: true
    },
    orderBy: { createdAt: "desc" }
  });
};

const updateUserStatus = async (id: string, activeStatus: "ACTIVE" | "BLOCKED") => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { activeStatus },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true
    }
  });
};

const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
      service: true,
      payment: true,
      review: true
    },
    orderBy: { createdAt: "desc" }
  });
};

const getAllPayments = async () => {
  return prisma.payment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      booking: { include: { service: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const adminService = {
  getUsers,
  updateUserStatus,
  getAllBookings,
  getAllPayments
};
