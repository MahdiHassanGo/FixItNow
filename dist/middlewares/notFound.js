"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Route not found",
        details: { method: req.method, path: req.originalUrl }
    });
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map