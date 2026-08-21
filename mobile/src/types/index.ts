// Shared types mirroring the backend's response DTOs (see backend/src/modules/*).
// Kept as a plain copy rather than a shared package — not worth the monorepo
// setup cost for a one-day MVP (same trade-off noted for Zod schemas in
// ARCHITECTURE_PLAN.md §1).

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export type OrderStatus = "pending" | "paid" | "failed";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  idempotencyKey: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface ShippingInfo {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}
