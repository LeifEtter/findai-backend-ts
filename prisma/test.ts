import { PrismaClient } from "@prisma/client";
import logger from "../src/logger";
const prisma = new PrismaClient();

async function main() {
  // const tools = await prisma.tool.findMany({ include: { tags: true } });
  const tags = ["video", "text", "image"];
  const tools = await prisma.tool.findMany({
    where: {
      tags: {
        some: {
          OR: tags.map((tag) => ({ name: tag })),
        },
      },
    },
  });
  logger.info(tools);
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
