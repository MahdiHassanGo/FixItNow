"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const ApiError_1 = require("../../core/ApiError");
const prisma_1 = require("../../lib/prisma");
const list = () => prisma_1.prisma.category.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { name: "asc" }
});
const create = (input) => prisma_1.prisma.category.create({ data: input });
const update = async (id, input) => {
    const exists = await prisma_1.prisma.category.findUnique({ where: { id } });
    if (!exists)
        throw new ApiError_1.ApiError(404, "Category not found");
    return prisma_1.prisma.category.update({ where: { id }, data: input });
};
const remove = async (id) => {
    const category = await prisma_1.prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { services: true } } }
    });
    if (!category)
        throw new ApiError_1.ApiError(404, "Category not found");
    if (category._count.services > 0) {
        throw new ApiError_1.ApiError(409, "This category cannot be deleted while services are using it");
    }
    await prisma_1.prisma.category.delete({ where: { id } });
    return { id };
};
exports.categoryService = { list, create, update, remove };
//# sourceMappingURL=category.service.js.map