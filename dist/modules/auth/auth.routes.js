"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_controller_1 = require("./auth.controller");
const auth_schemas_1 = require("./auth.schemas");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", (0, validateRequest_1.validateRequest)(auth_schemas_1.registerSchema), auth_controller_1.authController.register);
exports.authRouter.post("/login", (0, validateRequest_1.validateRequest)(auth_schemas_1.loginSchema), auth_controller_1.authController.login);
exports.authRouter.post("/refresh", (0, validateRequest_1.validateRequest)(auth_schemas_1.refreshSchema), auth_controller_1.authController.refresh);
exports.authRouter.post("/logout", auth_controller_1.authController.logout);
exports.authRouter.get("/me", (0, authenticate_1.authenticate)(client_1.Role.CUSTOMER, client_1.Role.TECHNICIAN, client_1.Role.ADMIN), auth_controller_1.authController.me);
//# sourceMappingURL=auth.routes.js.map