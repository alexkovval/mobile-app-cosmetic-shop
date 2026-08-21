import { Order, ShippingInfo } from "../types";
import { apiRequest } from "./client";

export interface CreateOrderInput {
  shippingInfo: ShippingInfo;
  cardLast4: string;
  idempotencyKey: string;
}

export function createOrderRequest({ idempotencyKey, ...body }: CreateOrderInput) {
  return apiRequest<{ order: Order }>("/orders", {
    method: "POST",
    body,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function listOrdersRequest(signal?: AbortSignal) {
  return apiRequest<{ orders: Order[] }>("/orders", { signal });
}

export function getOrderRequest(id: string, signal?: AbortSignal) {
  return apiRequest<{ order: Order; items: Order["items"] }>(`/orders/${id}`, { signal });
}
