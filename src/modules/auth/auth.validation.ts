import { z } from "zod";

const register = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    location: z.string().optional(),
    role: z.enum(["CUSTOMER", "TECHNICIAN"])
  })
});

const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

export const authValidation = {
  register,
  login
};
