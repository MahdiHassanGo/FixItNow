import { app } from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";

const start = async () => {
  await prisma.$connect();
  const server = app.listen(config.port, () => {
    console.log(`FixItNow API listening on http://localhost:${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received; shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

start().catch(async (error) => {
  console.error("Application failed to start", error);
  await prisma.$disconnect();
  process.exit(1);
});
