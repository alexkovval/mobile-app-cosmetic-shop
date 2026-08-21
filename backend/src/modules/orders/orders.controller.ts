import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth.middleware";
import { ValidationError } from "../../lib/errors";
import * as ordersService from "./orders.service";
import { idempotencyKeyHeaderSchema } from "./orders.schema";

export async function createOrderHandler(req: AuthedRequest, res: Response) {
  const rawKey = req.header("Idempotency-Key");
  const parsedKey = idempotencyKeyHeaderSchema.safeParse(rawKey);
  if (!parsedKey.success) {
    throw new ValidationError(
      "A valid Idempotency-Key header is required to create an order",
      parsedKey.error.flatten()
    );
  }

  const { order, replayed } = await ordersService.createOrder(
    req.userId!,
    parsedKey.data,
    req.body
  );
  res.status(replayed ? 200 : 201).json({ order });
}

export async function listOrdersHandler(req: AuthedRequest, res: Response) {
  const result = await ordersService.listOrders(req.userId!);
  res.status(200).json(result);
}

export async function getOrderHandler(req: AuthedRequest, res: Response) {
  const result = await ordersService.getOrder(req.userId!, req.params.id);
  res.status(200).json(result);
}
