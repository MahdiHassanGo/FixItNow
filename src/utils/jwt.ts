import type { Role } from "@prisma/client";
import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config";

export type TokenClaims = {
  sub: string;
  email: string;
  role: Role;
  type: "access" | "refresh";
};

const sign = (claims: TokenClaims, secret: string, expiresIn: string) =>
  jwt.sign(claims, secret, { expiresIn } as SignOptions);

export const createTokenPair = (input: Omit<TokenClaims, "type">) => ({
  accessToken: sign({ ...input, type: "access" }, config.jwt.accessSecret, config.jwt.accessExpiresIn),
  refreshToken: sign({ ...input, type: "refresh" }, config.jwt.refreshSecret, config.jwt.refreshExpiresIn)
});

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, config.jwt.accessSecret) as TokenClaims;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, config.jwt.refreshSecret) as TokenClaims;
