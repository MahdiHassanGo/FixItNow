"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const admin_service_1 = require("./admin.service");
const users = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const result = await admin_service_1.adminService.listUsers(req.query);
    (0, respond_1.respond)(res, { message: "Users retrieved", data: result.data, meta: result.meta });
});
const updateUserStatus = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, {
        message: "User status updated",
        data: await admin_service_1.adminService.updateUserStatus(req.user.id, String(req.params.id), req.body.activeStatus)
    });
});
const bookings = (0, asyncRoute_1.asyncRoute)(async (_req, res) => {
    (0, respond_1.respond)(res, { message: "All bookings retrieved", data: await admin_service_1.adminService.listBookings() });
});
const payments = (0, asyncRoute_1.asyncRoute)(async (_req, res) => {
    (0, respond_1.respond)(res, { message: "All payments retrieved", data: await admin_service_1.adminService.listPayments() });
});
exports.adminController = { users, updateUserStatus, bookings, payments };
//# sourceMappingURL=admin.controller.js.map