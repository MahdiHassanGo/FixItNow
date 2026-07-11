import { prisma } from "../../lib/prisma";

const create = async (payload: { name: string; description?: string }) => {
  return prisma.category.create({ data: payload });
};

const getAll = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

const update = async (id: string, payload: { name?: string; description?: string }) => {
  return prisma.category.update({ where: { id }, data: payload });
};

const remove = async (id: string) => {
  return prisma.category.delete({ where: { id } });
};

export const categoryService = {
  create,
  getAll,
  update,
  remove
};
