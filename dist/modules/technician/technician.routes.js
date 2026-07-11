"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.technicianDashboardRouter = exports.publicTechnicianRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const validateRequest_1 = require("../../middlewares/validateRequest");
const technician_controller_1 = require("./technician.controller");
const technician_schemas_1 = require("./technician.schemas");
exports.publicTechnicianRouter = (0, express_1.Router)();
exports.publicTechnicianRouter.get("/", (0, validateRequest_1.validateRequest)(technician_schemas_1.technicianQuerySchema), technician_controller_1.technicianController.list);
exports.publicTechnicianRouter.get("/:id", (0, validateRequest_1.validateRequest)(technician_schemas_1.technicianIdSchema), technician_controller_1.technicianController.getById);
exports.technicianDashboardRouter = (0, express_1.Router)();
exports.technicianDashboardRouter.use((0, authenticate_1.authenticate)(client_1.Role.TECHNICIAN));
exports.technicianDashboardRouter.put("/profile", (0, validateRequest_1.validateRequest)(technician_schemas_1.updateTechnicianProfileSchema), technician_controller_1.technicianController.updateProfile);
exports.technicianDashboardRouter.put("/availability", (0, validateRequest_1.validateRequest)(technician_schemas_1.updateAvailabilitySchema), technician_controller_1.technicianController.updateAvailability);
exports.technicianDashboardRouter.get("/bookings", technician_controller_1.technicianController.bookings);
exports.technicianDashboardRouter.patch("/bookings/:id", (0, validateRequest_1.validateRequest)(technician_schemas_1.technicianBookingStatusSchema), technician_controller_1.technicianController.updateBookingStatus);
//# sourceMappingURL=technician.routes.js.map