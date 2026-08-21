import request from "supertest";
import { randomUUID } from "crypto";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { resetDatabase } from "./setup";

const app = createApp();

/**
 * The single most important test in this codebase: it proves the
 * duplicate-order guard described in ARCHITECTURE_PLAN.md §7 actually holds.
 * Requires a real Postgres instance (see docker-compose.yml) — run
 * `docker compose up -d` and `npx prisma migrate deploy` against a test
 * database before running this suite.
 */
describe("POST /orders — duplicate prevention", () => {
  let token: string;
  let productId: string;
  const idempotencyKey = randomUUID();

  beforeAll(async () => {
    await resetDatabase();

    const product = await prisma.product.create({
      data: {
        name: "Test Serum",
        description: "A test product",
        price: 2500,
        category: "Skincare",
        stock: 10,
        imageUrl: "https://example.com/img.png",
      },
    });
    productId = product.id;

    const registerRes = await request(app).post("/auth/register").send({
      email: "duplicate-test@example.com",
      password: "password123",
      name: "Test User",
    });
    token = registerRes.body.token;

    await request(app)
      .post("/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId, quantity: 2 });
  });

  it("creates exactly one order when the same idempotency key is submitted twice", async () => {
    const payload = {
      shippingInfo: {
        fullName: "Test User",
        addressLine1: "123 Main St",
        city: "Testville",
        postalCode: "00000",
        country: "US",
      },
      cardLast4: "4242",
    };

    const first = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", idempotencyKey)
      .send(payload);

    expect(first.status).toBe(201);
    const firstOrderId = first.body.order.id;

    const second = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", idempotencyKey)
      .send(payload);

    // Replay: same order id back, 200 not 201 (nothing new was created).
    expect(second.status).toBe(200);
    expect(second.body.order.id).toBe(firstOrderId);

    const ordersInDb = await prisma.order.findMany({ where: { idempotencyKey } });
    expect(ordersInDb).toHaveLength(1);

    // Cart was cleared exactly once, not double-cleared / re-cleared.
    const cartItems = await prisma.cartItem.findMany({ where: { userId: ordersInDb[0].userId } });
    expect(cartItems).toHaveLength(0);
  });

  it("rejects order creation with no Idempotency-Key header", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        shippingInfo: {
          fullName: "Test User",
          addressLine1: "123 Main St",
          city: "Testville",
          postalCode: "00000",
          country: "US",
        },
        cardLast4: "4242",
      });

    expect(res.status).toBe(400);
  });
});
