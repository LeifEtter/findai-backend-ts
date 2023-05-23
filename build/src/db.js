"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// const prisma: PrismaClient = new PrismaClient({
//   log: ["query", "info", "warn", "error"],
// });
const prisma = new client_1.PrismaClient();
exports.default = prisma;
