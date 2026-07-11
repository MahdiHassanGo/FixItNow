"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.createTokenPair = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const sign = (claims, secret, expiresIn) => jsonwebtoken_1.default.sign(claims, secret, { expiresIn });
const createTokenPair = (input) => ({
    accessToken: sign({ ...input, type: "access" }, config_1.config.jwt.accessSecret, config_1.config.jwt.accessExpiresIn),
    refreshToken: sign({ ...input, type: "refresh" }, config_1.config.jwt.refreshSecret, config_1.config.jwt.refreshExpiresIn)
});
exports.createTokenPair = createTokenPair;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, config_1.config.jwt.accessSecret);
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map