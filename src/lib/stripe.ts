import Stripe from "stripe";
import { config } from "../config";
import { ApiError } from "../core/ApiError";

let stripeClient: Stripe | undefined;

export const getStripe = (): Stripe => {
  if (!config.stripe.secretKey) {
    throw new ApiError(503, "Stripe is not configured on this server");
  }

  stripeClient ??= new Stripe(config.stripe.secretKey);
  return stripeClient;
};
