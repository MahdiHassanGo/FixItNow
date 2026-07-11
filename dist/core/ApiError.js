"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    details;
    isOperational;
    constructor(statusCode, message, details, isOperational = true) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map