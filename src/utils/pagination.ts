export const buildPagination = (query: Record<string, unknown>) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = String(query.sortBy || "createdAt");
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  return { page, limit, skip, sortBy, sortOrder };
};

export const buildMeta = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit)
  };
};