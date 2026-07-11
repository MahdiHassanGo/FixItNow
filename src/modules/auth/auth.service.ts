import bcrypt from "bcryptjs";
import { Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  role: "CUSTOMER" | "TECHNICIAN";
};

type LoginPayload = {
  email: string;
  password: string;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  location: true,
  role: true,
  activeStatus: true,
  createdAt: true,
  updatedAt: true,
  technicianProfile: true
};

const createAuthTokens = (payload: { id: string; name: string; email: string; role: Role }) => {
  const accessToken = jwtUtils.createToken(payload, config.jwtAccessSecret, config.jwtAccessExpiresIn);
  const refreshToken = jwtUtils.createToken(payload, config.jwtRefreshSecret, config.jwtRefreshExpiresIn);
  return { accessToken, refreshToken };
};

const register = async (payload: RegisterPayload) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      location: payload.location,
      role: payload.role as Role,
      technicianProfile:
        payload.role === "TECHNICIAN"
          ? {
              create: {
                skills: [],
                pricePerHour: 0,
                location: payload.location
              }
            }
          : undefined
    },
    select: userSelect
  });

  return user;
};

const login = async (payload: LoginPayload) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.activeStatus === "BLOCKED") {
    throw new AppError(403, "Your account is blocked");
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  const tokenPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const tokens = createAuthTokens(tokenPayload);

  const loggedInUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: userSelect });

  return { ...tokens, user: loggedInUser };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(401, "Refresh token is required");
  }

  const decoded = jwtUtils.verifyToken(token, config.jwtRefreshSecret);
  const user = await prisma.user.findUnique({ where: { id: decoded.id as string } });

  if (!user || user.activeStatus === "BLOCKED") {
    throw new AppError(401, "Invalid refresh token");
  }

  const accessToken = jwtUtils.createToken(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    config.jwtAccessSecret,
    config.jwtAccessExpiresIn
  );

  return { accessToken };
};

const getMe = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({ where: { id: userId }, select: userSelect });
};

export const authService = {
  register,
  login,
  refreshToken,
  getMe
};
