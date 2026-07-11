"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const validateRequest_1 = require("../../middlewares/validateRequest");
const booking_controller_1 = require("./booking.controller");
const booking_schemas_1 = require("./booking.schemas");
exports.bookingRouter = (0, express_1.Router)();
exports.bookingRouter.post("/", (0, authenticate_1.authenticate)(client_1.Role.CUSTOMER), (0, validateRequest_1.validateRequest)(booking_schemas_1.createBookingSchema), booking_controller_1.bookingController.create);
exports.bookingRouter.get("/", (0, authenticate_1.authenticate)(client_1.Role.CUSTOMER, client_1.Role.TECHNICIAN, client_1.Role.ADMIN), booking_controller_1.bookingController.list);
exports.bookingRouter.get("/:id", (0, authenticate_1.authenticate)(client_1.Role.CUSTOMER, client_1.Role.TECHNICIAN, client_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(booking_schemas_1.bookingIdSchema), booking_controller_1.bookingController.getById);
exports.bookingRouter.patch("/:id/cancel", (0, authenticate_1.authenticate)(client_1.Role.CUSTOMER, client_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(booking_schemas_1.bookingIdSchema), booking_controller_1.bookingController.cancel);
//# sourceMappingURL=booking.routes.js.map