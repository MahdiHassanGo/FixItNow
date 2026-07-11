"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const ApiError_1 = require("../core/ApiError");
const validateRequest = (schema) => {
    return (req, _res, next) => {
        const parsed = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
            cookies: req.cookies
        });
        if (!parsed.success) {
            throw new ApiError_1.ApiError(400, "Request validation failed", parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            })));
        }
        const data = parsed.data;
        if (data.body !== undefined)
            req.body = data.body;
        if (data.params !== undefined)
            req.params = data.params;
        if (data.query !== undefined) {
            Object.defineProperty(req, "query", { value: data.query, configurable: true });
        }
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map