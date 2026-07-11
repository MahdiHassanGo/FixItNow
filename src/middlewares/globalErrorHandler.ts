import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { AppError } from "../errors/AppError";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers.authorization;

    const token = req.cookies?.accessToken || bearerToken;

    if (!token) {
      throw new AppError(401, "You are not logged in");
    }

    const decoded = jwtUtils.verifyToken(token, config.jwtAccessSecret) as JwtPayload;
    const { id, email, role, name } = decoded;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(403, "You do not have permission to access this resource");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, activeStatus: true }
    });

    if (!user || user.email !== email || user.role !== role) {
      throw new AppError(401, "Invalid authentication token");
    }

    if (user.activeStatus === "BLOCKED") {
      throw new AppError(403, "Your account is blocked");
    }

    req.user = { id: user.id, name: name || user.name, email: user.email, role: user.role };
    next();
  });
};