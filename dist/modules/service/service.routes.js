"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const validateRequest_1 = require("../../middlewares/validateRequest");
const service_controller_1 = require("./service.controller");
const service_schemas_1 = require("./service.schemas");
exports.serviceRouter = (0, express_1.Router)();
exports.serviceRouter.get("/", (0, validateRequest_1.validateRequest)(service_schemas_1.serviceQuerySchema), service_controller_1.serviceController.list);
exports.serviceRouter.get("/mine", (0, authenticate_1.authenticate)(client_1.Role.TECHNICIAN), service_controller_1.serviceController.mine);
exports.serviceRouter.get("/:id", (0, validateRequest_1.validateRequest)(service_schemas_1.serviceIdSchema), service_controller_1.serviceController.getById);
exports.serviceRouter.post("/", (0, authenticate_1.authenticate)(client_1.Role.TECHNICIAN), (0, validateRequest_1.validateRequest)(service_schemas_1.createServiceSchema), service_controller_1.serviceController.create);
exports.serviceRouter.patch("/:id", (0, authenticate_1.authenticate)(client_1.Role.TECHNICIAN, client_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(service_schemas_1.updateServiceSchema), service_controller_1.serviceController.update);
exports.serviceRouter.delete("/:id", (0, authenticate_1.authenticate)(client_1.Role.TECHNICIAN, client_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(service_schemas_1.serviceIdSchema), service_controller_1.serviceController.archive);
//# sourceMappingURL=service.routes.js.map