"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceController = void 0;
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const service_service_1 = require("./service.service");
const list = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const result = await service_service_1.serviceService.list(req.query);
    (0, respond_1.respond)(res, { message: "Services retrieved", data: result.data, meta: result.meta });
});
const getById = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Service retrieved", data: await service_service_1.serviceService.getById(String(req.params.id)) });
});
const mine = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { message: "Your services retrieved", data: await service_service_1.serviceService.listMine(req.user.id) });
});
const create = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, { statusCode: 201, message: "Service created", data: await service_service_1.serviceService.create(req.user.id, req.body) });
});
const update = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, {
        message: "Service updated",
        data: await service_service_1.serviceService.update(req.user.id, req.user.role, String(req.params.id), req.body)
    });
});
const archive = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    (0, respond_1.respond)(res, {
        message: "Service removed",
        data: await service_service_1.serviceService.archive(req.user.id, req.user.role, String(req.params.id))
    });
});
exports.serviceController = { list, getById, mine, create, update, archive };
//# sourceMappingURL=service.controller.js.map