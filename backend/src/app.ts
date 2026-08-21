import cors from "cors";
import express from "express";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import cartRoutes from "./modules/cart/cart.routes";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import ordersRoutes from "./modules/orders/orders.routes";
import productsRoutes, { categoriesRoutes } from "./modules/products/products.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Serves the category placeholder photos referenced by prisma/seed.ts
  // (e.g. GET /images/skincare.jpg) — real product photography is out of
  // scope for this MVP, but hosting a few representative photos ourselves
  // means product images work with zero external dependency at demo time.
  // Resolved from process.cwd() (not __dirname) so this finds public/images
  // whether running via ts-node-dev (src/) or the compiled build (dist/) —
  // npm always runs both with cwd set to the backend/ package root.
  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

  app.use("/auth", authRoutes);
  app.use("/products", productsRoutes);
  app.use("/categories", categoriesRoutes);
  app.use("/cart", cartRoutes);
  app.use("/orders", ordersRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
