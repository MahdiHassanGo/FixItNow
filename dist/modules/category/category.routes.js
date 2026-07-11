"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const validateRequest_1 = require("../../middlewares/validateRequest");
const category_controller_1 = require("./category.controller");
const category_schemas_1 = require("./category.schemas");
exports.categoryRouter = (0, express_1.Router)();
exports.categoryRouter.get("/", category_controller_1.categoryController.list);
exports.categoryRouter.post("/", (0, authenticate_1.authenticate)(client_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(category_schemas_1.createCategorySchema), category_controller_1.categoryController.create);
exports.categoryRouter.patch("/:id", (0, authenticate_1.authenticate)(client_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(category_schemas_1.updateCategorySchema), category_controller_1.categoryController.update);
exports.categoryRouter.delete("/:id", (0, authenticate_1.authenticate)(client_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(category_schemas_1.categoryIdSchema), category_controller_1.categoryController.remove);
//# sourceMappingURL=category.routes.js.map