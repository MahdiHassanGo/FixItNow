"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = require("../../lib/prisma");
const userSelect_1 = require("../../utils/userSelect");
const updateMyProfile = async (userId, input) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id: userId },
            data: input,
            select: userSelect_1.publicUserSelect
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
exports.userService = { updateMyProfile };
//# sourceMappingURL=user.service.js.map