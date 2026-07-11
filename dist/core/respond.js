"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respond = void 0;
const respond = (res, payload) => {
    const statusCode = payload.statusCode ?? 200;
    res.status(statusCode).json({
        success: true,
        statusCode,
        message: payload.message,
        data: payload.data,
        ...(payload.meta ? { meta: payload.meta } : {})
    });
};
exports.respond = respond;
//# sourceMappingURL=respond.js.map