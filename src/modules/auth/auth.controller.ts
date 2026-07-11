import type { Request, Response } from "express";
import { config } from "../../config";
import { asyncRoute } from "../../core/asyncRoute";
import { respond } from "../../core/respond";
import { authService } from "./auth.service";

const cookieBase = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: config.nodeEnv === "production" ? "none" : "lax"
} as const;

const register = asyncRoute(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  respond(res, { statusCode: 201, message: "Account created successfully", data: user });
});

const login = asyncRoute(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie("accessToken", result.accessToken, { ...cookieBase, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie("refreshToken", result.refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
  respond(res, { message: "Login successful", data: result });
});

const refresh = asyncRoute(async (req: Request, res: Response) => {
  const suppliedToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
  const tokens = await authService.refresh(suppliedToken);
  res.cookie("accessToken", tokens.accessToken, { ...cookieBase, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie("refreshToken", tokens.refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
  respond(res, { message: "Tokens refreshed successfully", data: tokens });
});

const logout = asyncRoute(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", cookieBase);
  res.clearCookie("refreshToken", cookieBase);
  respond(res, { message: "Logout successful", data: null });
});

const me = asyncRoute(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  respond(res, { message: "Current user retrieved", data: user });
});

export const authController = { register, login, refresh, logout, me };
