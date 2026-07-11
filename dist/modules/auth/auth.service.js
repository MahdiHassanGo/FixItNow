"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../../config");
const ApiError_1 = require("../../core/ApiError");
const prisma_1 = require("../../lib/prisma");
const jwt_1 = require("../../utils/jwt");
const userSelect_1 = require("../../utils/userSelect");
const tokenPayload = (user) => ({
    sub: user.id,
    email: user.email,
    role: user.role
});
const register = async (input) => {
    const duplicate = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (duplicate)
        throw new ApiError_1.ApiError(409, "An account already exists with this email");
    const password = await bcryptjs_1.default.hash(input.password, config_1.config.bcryptSaltRounds);
    const role = input.role === "TECHNICIAN" ? client_1.Role.TECHNICIAN : client_1.Role.CUSTOMER;
    return prisma_1.prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password,
            phone: input.phone,
            location: input.location,
            role,
            ...(role === client_1.Role.TECHNICIAN
                ? {
                    technicianProfile: {
                        create: {
                            skills: [],
                            location: input.location,
                            pricePerHour: 0
                        }
                    }
                }
                : {})
        },
        select: {
            ...userSelect_1.publicUserSelect,
            technicianProfile: true
        }
    });
};
const login = async (input) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcryptjs_1.default.compare(input.password, user.password))) {
        throw new ApiError_1.ApiError(401, "Email or password is incorrect");
    }
    if (user.activeStatus === "BLOCKED")
        throw new ApiError_1.ApiError(403, "This account has been blocked");
    const tokens = (0, jwt_1.createTokenPair)(tokenPayload(user));
    const safeUser = await prisma_1.prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { ...userSelect_1.publicUserSelect, technicianProfile: true }
    });
    return { user: safeUser, ...tokens };
};
const refresh = async (refreshToken) => {
    if (!refreshToken)
        throw new ApiError_1.ApiError(401, "Refresh token is required");
    let claims;
    try {
        claims = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        throw new ApiError_1.ApiError(401, "Refresh token is invalid or expired");
    }
    if (claims.type !== "refresh")
        throw new ApiError_1.ApiError(401, "Invalid token type");
    const user = await prisma_1.prisma.user.findUnique({ where: { id: claims.sub } });
    if (!user || user.email !== claims.email || user.activeStatus === "BLOCKED") {
        throw new ApiError_1.ApiError(401, "Refresh token is no longer valid");
    }
    return (0, jwt_1.createTokenPair)(tokenPayload(user));
};
const getCurrentUser = (userId) => prisma_1.prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { ...userSelect_1.publicUserSelect, technicianProfile: true }
});
exports.authService = { register, login, refresh, getCurrentUser };
//# sourceMappingURL=auth.service.js.map