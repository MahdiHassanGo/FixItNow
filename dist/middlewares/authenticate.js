"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const ApiError_1 = require("../core/ApiError");
const asyncRoute_1 = require("../core/asyncRoute");
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../utils/jwt");
const getToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer "))
        return authHeader.slice(7);
    return req.cookies?.accessToken;
};
const authenticate = (...allowedRoles) => (0, asyncRoute_1.asyncRoute)(async (req, _res, next) => {
    const token = getToken(req);
    if (!token)
        throw new ApiError_1.ApiError(401, "Authentication is required");
    let claims;
    try {
        claims = (0, jwt_1.verifyAccessToken)(token);
    }
    catch {
        throw new ApiError_1.ApiError(401, "Access token is invalid or expired");
    }
    if (claims.type !== "access")
        throw new ApiError_1.ApiError(401, "Invalid token type");
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: claims.sub },
        select: { id: true, name: true, email: true, role: true, activeStatus: true }
    });
    if (!user || user.email !== claims.email)
        throw new ApiError_1.ApiError(401, "Authenticated user no longer exists");
    if (user.activeStatus === "BLOCKED")
        throw new ApiError_1.ApiError(403, "This account has been blocked");
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new ApiError_1.ApiError(403, "You do not have permission to perform this action");
    }
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
});
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map