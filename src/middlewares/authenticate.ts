import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../core/ApiError";
import { asyncRoute } from "../core/asyncRoute";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../utils/jwt";

const getToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.cookies?.accessToken as string | undefined;
};

export const authenticate = (...allowedRoles: Role[]) =>
  asyncRoute(async (req: Request, _res: Response, next: NextFunction) => {
    const token = getToken(req);
    if (!token) throw new ApiError(401, "Authentication is required");

    let claims;
    try {
      claims = verifyAccessToken(token);
    } catch {
      throw new ApiError(401, "Access token is invalid or expired");
    }

    if (claims.type !== "access") throw new ApiError(401, "Invalid token type");

    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, name: true, email: true, role: true, activeStatus: true }
    });

    if (!user || user.email !== claims.email) throw new ApiError(401, "Authenticated user no longer exists");
    if (user.activeStatus === "BLOCKED") throw new ApiError(403, "This account has been blocked");
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  });
