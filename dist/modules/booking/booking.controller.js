"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const booking_service_1 = require("./booking.service");
const create = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { statusCode: 201, message: "Booking requested", data: await booking_service_1.bookingService.create(req.user.id, req.body) });
});
const list = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Bookings retrieved", data: await booking_service_1.bookingService.listForUser(req.user.id, req.user.role) });
});
const getById = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, {
        message: "Booking retrieved",
        data: await booking_service_1.bookingService.getById(req.user.id, req.user.role, String(req.params.id))
    });
});
const cancel = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, {
        message: "Booking cancelled",
        data: await booking_service_1.bookingService.cancel(req.user.id, req.user.role, String(req.params.id))
    });
});
exports.bookingController = { create, list, getById, cancel };
//# sourceMappingURL=booking.controller.js.map