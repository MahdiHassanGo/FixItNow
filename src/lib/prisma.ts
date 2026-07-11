import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "../config";

const globalPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: config.databaseUrl });

export const prisma = globalPrisma.prisma ?? new PrismaClient({ adapter });

if (config.nodeEnv !== "production") {
  globalPrisma.prisma = prisma;
}
