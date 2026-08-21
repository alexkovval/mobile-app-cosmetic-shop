import { PrismaClient } from "@prisma/client";

// Single shared Prisma client instance for the whole process.
// Avoids exhausting SQLite connections via ts-node-dev hot-reload creating
// a new client on every file change.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
