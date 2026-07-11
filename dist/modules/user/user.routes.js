"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_controller_1 = require("./user.controller");
const user_schemas_1 = require("./user.schemas");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.patch("/me", (0, authenticate_1.authenticate)(client_1.Role.CUSTOMER, client_1.Role.TECHNICIAN, client_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(user_schemas_1.updateMyProfileSchema), user_controller_1.userController.updateMe);
//# sourceMappingURL=user.routes.js.map