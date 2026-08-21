import { NotFoundError, ValidationError } from "../../lib/errors";
import { calculateOrderTotals } from "../../lib/pricing";
import { prisma } from "../../lib/prisma";
import { CreateOrderInput } from "./orders.schema";

/**
 * Creates an order for the user's current cart, guarded by an
 * Idempotency-Key so retries (double-taps, network retries, app relaunches)
 * never create a second order.
 *
 * See ARCHITECTURE_PLAN.md §7 for the full three-layer rationale — this is
 * the server-side layer, enforced at the database level via the unique
 * constraint on Order.idempotencyKey, not just by this lookup-then-create
 * check (the unique constraint is what actually holds under a race; this
 * check just gives a clean "replay" response instead of a 409 on the retry).
 */
export async function createOrder(
  userId: string,
  idempotencyKey: string,
  input: CreateOrderInput
) {
  // 1. Replay check: if this exact idempotency key already produced an
  // order, return it as-is. Do NOT touch the cart or create anything.
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey },
    include: { items: true },
  });
  if (existing) {
    return { order: existing, replayed: true };
  }

  // 2. Otherwise, do the whole read-price-write sequence in one transaction
  // so a crash mid-way can never leave an order without items, or a
  // cleared cart without a corresponding order.
  const order = await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new ValidationError("Your cart is empty");
    }

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        throw new ValidationError(
          `${item.product.name} only has ${item.product.stock} left in stock`,
          { productId: item.productId }
        );
      }
    }

    // Re-price from CURRENT product prices — the client never gets to
    // dictate a total.
    const totals = calculateOrderTotals(
      cartItems.map((i) => ({
        productId: i.productId,
        unitPrice: i.product.price,
        quantity: i.quantity,
      }))
    );

    const created = await tx.order.create({
      data: {
        userId,
        status: "paid", // mock payment always "succeeds" in this MVP — see README
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        idempotencyKey,
        items: {
          create: cartItems.map((i) => ({
            productId: i.productId,
            nameSnapshot: i.product.name,
            priceSnapshot: i.product.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { userId } });

    return created;
  });

  return { order, replayed: false };
}

export async function listOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return { orders };
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.userId !== userId) {
    throw new NotFoundError("Order not found");
  }
  return { order, items: order.items };
}
