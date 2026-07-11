"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../config");
const ApiError_1 = require("../core/ApiError");
let stripeClient;
const getStripe = () => {
    if (!config_1.config.stripe.secretKey) {
        throw new ApiError_1.ApiError(503, "Stripe is not configured on this server");
    }
    stripeClient ??= new stripe_1.default(config_1.config.stripe.secretKey);
    return stripeClient;
};
exports.getStripe = getStripe;
//# sourceMappingURL=stripe.js.map