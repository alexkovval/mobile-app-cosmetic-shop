import { NotFoundError, ValidationError } from "../../lib/errors";
import { calculateSubtotal } from "../../lib/pricing";
import { prisma } from "../../lib/prisma";
import { AddCartItemInput, UpdateCartItemInput } from "./cart.schema";

async function cartResponse(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  const subtotal = calculateSubtotal(
    items.map((i) => ({ productId: i.productId, unitPrice: i.product.price, quantity: i.quantity }))
  );

  return { items, subtotal };
}

export async function getCart(userId: string) {
  return cartResponse(userId);
}

export async function addItem(userId: string, input: AddCartItemInput) {
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product) {
    throw new NotFoundError("Product not found", { field: "productId" });
  }
  if (product.stock < input.quantity) {
    throw new ValidationError("Not enough stock for this product", { field: "quantity" });
  }

  // Upsert on the (userId, productId) unique constraint: re-adding a product
  // increments its quantity instead of creating a second row.
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId: input.productId } },
    update: { quantity: { increment: input.quantity } },
    create: { userId, productId: input.productId, quantity: input.quantity },
  });

  return cartResponse(userId);
}

export async function updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) {
    throw new NotFoundError("Cart item not found");
  }

  const product = await prisma.product.findUnique({ where: { id: item.productId } });
  if (product && product.stock < input.quantity) {
    throw new ValidationError("Not enough stock for this product", { field: "quantity" });
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: input.quantity } });
  return cartResponse(userId);
}

export async function removeItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) {
    throw new NotFoundError("Cart item not found");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return cartResponse(userId);
}
