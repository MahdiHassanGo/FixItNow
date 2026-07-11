import { prisma } from "../../lib/prisma";
import { publicUserSelect } from "../../utils/userSelect";

type UpdateProfileInput = { name?: string; phone?: string | null; location?: string | null };

const updateMyProfile = async (userId: string, input: UpdateProfileInput) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: input,
      select: publicUserSelect
    });

    if (user.role === "TECHNICIAN" && input.location !== undefined) {
      await tx.technicianProfile.updateMany({
        where: { userId },
        data: { location: input.location }
      });
    }
    return user;
  });
};

export const userService = { updateMyProfile };
