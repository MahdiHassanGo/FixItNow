"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const validateRequest_1 = require("../../middlewares/validateRequest");
const review_controller_1 = require("./review.controller");
const review_schemas_1 = require("./review.schemas");
exports.reviewRouter = (0, express_1.Router)();
exports.reviewRouter.post("/", (0, authenticate_1.authenticate)(client_1.Role.CUSTOMER), (0, validateRequest_1.validateRequest)(review_schemas_1.createReviewSchema), review_controller_1.reviewController.create);
exports.reviewRouter.get("/technician/:technicianId", (0, validateRequest_1.validateRequest)(review_schemas_1.technicianReviewSchema), review_controller_1.reviewController.listForTechnician);
//# sourceMappingURL=review.routes.js.map