import { z } from "zod";

const updateUserStatus = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ activeStatus: z.enum(["ACTIVE", "BLOCKED"]) })
});

export const adminValidation = {
  updateUserStatus
};
