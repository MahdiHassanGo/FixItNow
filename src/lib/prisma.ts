import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as PrismaClientPkg from "@prisma/client";
const PrismaClient: any = (PrismaClientPkg as any).PrismaClient ?? (PrismaClientPkg as any).default ?? PrismaClientPkg;

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };