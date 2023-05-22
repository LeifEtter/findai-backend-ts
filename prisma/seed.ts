import { PrismaClient } from "@prisma/client";
import logger from "../src/logger";
const prisma = new PrismaClient();

async function main() {
  return;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
