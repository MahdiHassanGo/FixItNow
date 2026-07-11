"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const prisma_1 = require("./lib/prisma");
const start = async () => {
    await prisma_1.prisma.$connect();
    const server = app_1.app.listen(config_1.config.port, () => {
        console.log(`FixItNow API listening on http://localhost:${config_1.config.port}`);
    });
    const shutdown = async (signal) => {
        console.log(`${signal} received; shutting down gracefully`);
        server.close(async () => {
            await prisma_1.prisma.$disconnect();
            process.exit(0);
        });
    };
    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
};
start().catch(async (error) => {
    console.error("Application failed to start", error);
    await prisma_1.prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=server.js.map