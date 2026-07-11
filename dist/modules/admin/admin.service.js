"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../../core/ApiError");
const pagination_1 = require("../../core/pagination");
const prisma_1 = require("../../lib/prisma");
const userSelect_1 = require("../../utils/userSelect");
const listUsers = async (query) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const where = {
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
    const [data, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.findMany({
            where,
            select: { ...userSelect_1.publicUserSelect, technicianProfile: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma_1.prisma.user.count({ where })
    ]);
    return { data, meta: (0, pagination_1.getPaginationMeta)(page, limit, total) };
};
const updateUserStatus = async (adminId, userId, status) => {
    if (adminId === userId && status === client_1.ActiveStatus.BLOCKED) {
        throw new ApiError_1.ApiError(400, "Administrators cannot block their own account");
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: { activeStatus: status },
        select: userSelect_1.publicUserSelect
    });
};
const listBookings = () => prisma_1.prisma.booking.findMany({
    include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: { include: { user: { select: { id: true, name: true, email: true } } } },
        service: { include: { category: true } },
        payment: true,
        review: true
    },
    orderBy: { createdAt: "desc" }
});
const listPayments = () => prisma_1.prisma.payment.findMany({
    include: {
        user: { select: { id: true, name: true, email: true } },
        booking: { include: { service: true } }
    },
    orderBy: { createdAt: "desc" }
});
exports.adminService = { listUsers, updateUserStatus, listBookings, listPayments };
//# sourceMappingURL=admin.service.js.map