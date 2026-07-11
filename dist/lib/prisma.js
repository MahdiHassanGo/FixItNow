"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const globalPrisma = globalThis;
const adapter = new adapter_pg_1.PrismaPg({ connectionString: config_1.config.databaseUrl });
exports.prisma = globalPrisma.prisma ?? new client_1.PrismaClient({ adapter });
if (config_1.config.nodeEnv !== "production") {
    globalPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map