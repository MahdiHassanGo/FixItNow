import { z } from "zod";

export const userStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ activeStatus: z.enum(["ACTIVE", "BLOCKED"]) })
});

export const adminUserQuerySchema = z.object({
  query: z.object({
    role: z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]).optional(),
    activeStatus: z.enum(["ACTIVE", "BLOCKED"]).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
  })
});
