import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "../../config";
import { ApiError } from "../../core/ApiError";
import { prisma } from "../../lib/prisma";
import { createTokenPair, verifyRefreshToken } from "../../utils/jwt";
import { publicUserSelect } from "../../utils/userSelect";

type RegistrationInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  role: "CUSTOMER" | "TECHNICIAN";
};

type LoginInput = { email: string; password: string };

const tokenPayload = (user: { id: string; email: string; role: Role }) => ({
  sub: user.id,
  email: user.email,
  role: user.role
});

const register = async (input: RegistrationInput) => {
  const duplicate = await prisma.user.findUnique({ where: { email: input.email } });
  if (duplicate) throw new ApiError(409, "An account already exists with this email");

  const password = await bcrypt.hash(input.password, config.bcryptSaltRounds);
  const role = input.role === "TECHNICIAN" ? Role.TECHNICIAN : Role.CUSTOMER;

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password,
      phone: input.phone,
      location: input.location,
      role,
      ...(role === Role.TECHNICIAN
        ? {
            technicianProfile: {
              create: {
                skills: [],
                location: input.location,
                pricePerHour: 0
              }
            }
          }
        : {})
    },
    select: {
      ...publicUserSelect,
      technicianProfile: true
    }
  });
};

const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new ApiError(401, "Email or password is incorrect");
  }
  if (user.activeStatus === "BLOCKED") throw new ApiError(403, "This account has been blocked");

  const tokens = createTokenPair(tokenPayload(user));
  const safeUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { ...publicUserSelect, technicianProfile: true }
  });

  return { user: safeUser, ...tokens };
};

const refresh = async (refreshToken: string | undefined) => {
  if (!refreshToken) throw new ApiError(401, "Refresh token is required");

  let claims;
  try {
    claims = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }
  if (claims.type !== "refresh") throw new ApiError(401, "Invalid token type");

  const user = await prisma.user.findUnique({ where: { id: claims.sub } });
  if (!user || user.email !== claims.email || user.activeStatus === "BLOCKED") {
    throw new ApiError(401, "Refresh token is no longer valid");
  }

  return createTokenPair(tokenPayload(user));
};

const getCurrentUser = (userId: string) =>
  prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { ...publicUserSelect, technicianProfile: true }
  });

export const authService = { register, login, refresh, getCurrentUser };
