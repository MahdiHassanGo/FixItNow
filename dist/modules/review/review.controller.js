"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = void 0;
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const review_service_1 = require("./review.service");
const create = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { statusCode: 201, message: "Review submitted", data: await review_service_1.reviewService.create(req.user.id, req.body) });
});
const listForTechnician = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, {
        message: "Technician reviews retrieved",
        data: await review_service_1.reviewService.listForTechnician(String(req.params.technicianId))
    });
});
exports.reviewController = { create, listForTechnician };
//# sourceMappingURL=review.controller.js.map