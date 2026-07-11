"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationMeta = exports.getPagination = void 0;
const getPagination = (input) => {
    const page = Math.max(1, Number(input.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(input.limit ?? 10)));
    return { page, limit, skip: (page - 1) * limit };
};
exports.getPagination = getPagination;
const getPaginationMeta = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
});
exports.getPaginationMeta = getPaginationMeta;
//# sourceMappingURL=pagination.js.map