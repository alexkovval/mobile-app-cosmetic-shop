import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// Wipe tables between test files so each suite starts from a clean slate.
// Order matters: children before parents (FK constraints).
export async function resetDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

afterAll(async () => {
  await prisma.$disconnect();
});
