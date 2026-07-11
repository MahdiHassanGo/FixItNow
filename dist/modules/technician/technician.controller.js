"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.technicianController = void 0;
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const technician_service_1 = require("./technician.service");
const list = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const result = await technician_service_1.technicianService.list(req.query);
    (0, respond_1.respond)(res, { message: "Technicians retrieved", data: result.data, meta: result.meta });
});
const getById = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Technician profile retrieved", data: await technician_service_1.technicianService.getById(String(req.params.id)) });
});
const updateProfile = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Technician profile updated", data: await technician_service_1.technicianService.updateProfile(req.user.id, req.body) });
});
const updateAvailability = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Availability updated", data: await technician_service_1.technicianService.replaceAvailability(req.user.id, req.body.slots) });
});
const bookings = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Technician bookings retrieved", data: await technician_service_1.technicianService.listBookings(req.user.id) });
});
const updateBookingStatus = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, {
        message: "Booking status updated",
        data: await technician_service_1.technicianService.changeBookingStatus(req.user.id, String(req.params.id), req.body.status)
    });
});
exports.technicianController = { list, getById, updateProfile, updateAvailability, bookings, updateBookingStatus };
//# sourceMappingURL=technician.controller.js.map