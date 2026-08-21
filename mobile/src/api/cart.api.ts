import { Cart } from "../types";
import { apiRequest } from "./client";

export function getCartRequest(signal?: AbortSignal) {
  return apiRequest<Cart>("/cart", { signal });
}

export function addCartItemRequest(input: { productId: string; quantity?: number }) {
  return apiRequest<Cart>("/cart/items", { method: "POST", body: input });
}

export function updateCartItemRequest(itemId: string, input: { quantity: number }) {
  return apiRequest<Cart>(`/cart/items/${itemId}`, { method: "PATCH", body: input });
}

export function removeCartItemRequest(itemId: string) {
  return apiRequest<Cart>(`/cart/items/${itemId}`, { method: "DELETE" });
}
