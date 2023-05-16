import { PrismaClient } from "@prisma/client";

// const logLevels: string[] = ["query", "info", "warn", "error"];
// const prisma: PrismaClient = new PrismaClient({
//   log: logLevels.map((level) => ({ emit: "event", level })),
//   errorFormat: "pretty",
// });

const prisma: PrismaClient = new PrismaClient();

export default prisma;
