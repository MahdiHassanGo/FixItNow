import { z } from "zod";

const password = z.string().min(8).max(72).regex(/[A-Za-z]/, "Password must contain a letter").regex(/\d/, "Password must contain a number");

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    password,
    phone: z.string().trim().min(6).max(30).optional(),
    location: z.string().trim().min(2).max(180).optional(),
    role: z.enum(["CUSTOMER", "TECHNICIAN"])
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1)
  })
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().optional() }).optional()
});
