import "dotenv/config";
import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const main = async () => {
  try {
    await prisma.$connect();
    app.listen(config.port, () => {
      console.log(`FixItNow server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();