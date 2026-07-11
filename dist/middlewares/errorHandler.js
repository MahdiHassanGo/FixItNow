"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const ApiError_1 = require("../core/ApiError");
const errorHandler = (error, _req, res, _next) => {
    let statusCode = 500;
    let message = "Internal server error";
    let details;
    if (error instanceof ApiError_1.ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        details = error.details;
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            statusCode = 409;
            message = "A record with the same unique value already exists";
            details = error.meta;
        }
        else if (error.code === "P2025") {
            statusCode = 404;
            message = "Requested record was not found";
        }
    }
    else if (error instanceof Error && error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token";
    }
    if (statusCode === 500)
        console.error(error);
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(details !== undefined ? { details } : {}),
        ...(config_1.config.nodeEnv !== "production" && error instanceof Error ? { stack: error.stack } : {})
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map