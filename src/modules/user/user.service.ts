import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

const updateMe = async (userId: string, payload: { name?: string; phone?: string; location?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const userService = {
  updateMe
};
