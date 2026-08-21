import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { resetDatabase } from "./setup";

const app = createApp();

/**
 * Covers the two ways the cart module rejects a bad request before it ever
 * reaches checkout: adding/updating past a product's stock, and referencing
 * a product that doesn't exist. See cart.service.ts.
 */
describe("POST/PATCH /cart/items — stock and existence checks", () => {
  let token: string;
  let limitedStockProductId: string;

  beforeAll(async () => {
    await resetDatabase();

    const product = await prisma.product.create({
      data: {
        name: "Limited Edition Lipstick",
        description: "Only a couple left",
        price: 1800,
        category: "Makeup",
        stock: 2,
        imageUrl: "https://example.com/img.png",
      },
    });
    limitedStockProductId = product.id;

    const registerRes = await request(app).post("/auth/register").send({
      email: "cart-stock-test@example.com",
      password: "password123",
      name: "Cart Test User",
    });
    token = registerRes.body.token;
  });

  it("rejects adding more than the available stock", async () => {
    const res = await request(app)
      .post("/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: limitedStockProductId, quantity: 5 });

    expect(res.status).toBe(400);

    const cartItems = await prisma.cartItem.findMany({ where: { productId: limitedStockProductId } });
    expect(cartItems).toHaveLength(0);
  });

  it("rejects a productId that doesn't exist", async () => {
    const res = await request(app)
      .post("/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: "does-not-exist", quantity: 1 });

    expect(res.status).toBe(404);
  });

  it("rejects updating an existing line past the available stock", async () => {
    const addRes = await request(app)
      .post("/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: limitedStockProductId, quantity: 1 });
    expect(addRes.status).toBe(200);
    const itemId = addRes.body.items[0].id;

    const updateRes = await request(app)
      .patch(`/cart/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 10 });

    expect(updateRes.status).toBe(400);

    // The line's quantity is unchanged — the rejected update didn't partially apply.
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    expect(item?.quantity).toBe(1);
  });
});
