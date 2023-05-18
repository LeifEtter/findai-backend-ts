import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.tag.deleteMany();
  const tags = ["text", "video", "image"];

  for (const tag of tags) {
    await prisma.tag.create({
      data: {
        name: tag,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
