"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const config_1 = require("../../config");
const asyncRoute_1 = require("../../core/asyncRoute");
const respond_1 = require("../../core/respond");
const auth_service_1 = require("./auth.service");
const cookieBase = {
    httpOnly: true,
    secure: config_1.config.nodeEnv === "production",
    sameSite: config_1.config.nodeEnv === "production" ? "none" : "lax"
};
const register = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const user = await auth_service_1.authService.register(req.body);
    (0, respond_1.respond)(res, { statusCode: 201, message: "Account created successfully", data: user });
});
const login = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const result = await auth_service_1.authService.login(req.body);
    res.cookie("accessToken", result.accessToken, { ...cookieBase, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", result.refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
    (0, respond_1.respond)(res, { message: "Login successful", data: result });
});
const refresh = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const suppliedToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
    const tokens = await auth_service_1.authService.refresh(suppliedToken);
    res.cookie("accessToken", tokens.accessToken, { ...cookieBase, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", tokens.refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
    (0, respond_1.respond)(res, { message: "Tokens refreshed successfully", data: tokens });
});
const logout = (0, asyncRoute_1.asyncRoute)(async (_req, res) => {
    res.clearCookie("accessToken", cookieBase);
    res.clearCookie("refreshToken", cookieBase);
    (0, respond_1.respond)(res, { message: "Logout successful", data: null });
});
const me = (0, asyncRoute_1.asyncRoute)(async (req, res) => {
    const user = await auth_service_1.authService.getCurrentUser(req.user.id);
    (0, respond_1.respond)(res, { message: "Current user retrieved", data: user });
});
exports.authController = { register, login, refresh, logout, me };
//# sourceMappingURL=auth.controller.js.map