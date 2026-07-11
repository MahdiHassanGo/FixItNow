"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const user_service_1 = require("./user.service");
const updateMe = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const user = await user_service_1.userService.updateMyProfile(req.user.id, req.body);
    (0, respond_1.respond)(res, { message: "Profile updated successfully", data: user });
});
exports.userController = { updateMe };
//# sourceMappingURL=user.controller.js.map