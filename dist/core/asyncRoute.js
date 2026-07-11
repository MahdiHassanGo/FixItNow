"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncRoute = void 0;
const asyncRoute = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};
exports.asyncRoute = asyncRoute;
//# sourceMappingURL=asyncRoute.js.map