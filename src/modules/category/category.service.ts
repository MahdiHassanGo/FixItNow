import { ApiError } from "../../core/ApiError";
import { prisma } from "../../lib/prisma";

type CategoryInput = { name: string; description?: string | null };

const list = () =>
  prisma.category.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { name: "asc" }
  });

const create = (input: CategoryInput) => prisma.category.create({ data: input });

const update = async (id: string, input: CategoryInput) => {
  const exists = await prisma.category.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, "Category not found");
  return prisma.category.update({ where: { id }, data: input });
};

const remove = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { services: true } } }
  });
  if (!category) throw new ApiError(404, "Category not found");
  if (category._count.services > 0) {
    throw new ApiError(409, "This category cannot be deleted while services are using it");
  }
  await prisma.category.delete({ where: { id } });
  return { id };
};

export const categoryService = { list, create, update, remove };
