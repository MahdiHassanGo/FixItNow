"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const category_service_1 = require("./category.service");
const list = (0, asyncRoute_1.asyncRoute)(async (_req, res) => {
    (0, respond_1.respond)(res, { message: "Categories retrieved", data: await category_service_1.categoryService.list() });
});
const create = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { statusCode: 201, message: "Category created", data: await category_service_1.categoryService.create(req.body) });
});
const update = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Category updated", data: await category_service_1.categoryService.update(String(req.params.id), req.body) });
});
const remove = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Category deleted", data: await category_service_1.categoryService.remove(String(req.params.id)) });
});
exports.categoryController = { list, create, update, remove };
//# sourceMappingURL=category.controller.js.map