import { Product } from "../types";
import { apiRequest } from "./client";

export interface ListProductsParams {
  // Explicit index signature — without it, TS won't treat this interface as
  // assignable to apiRequest's `query?: Record<string, string | number |
  // undefined>` option below, even though every declared property already
  // matches that shape.
  [key: string]: string | number | undefined;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ListProductsResponse {
  items: Product[];
  page: number;
  limit: number;
  total: number;
}

export function listProductsRequest(params: ListProductsParams, signal?: AbortSignal) {
  return apiRequest<ListProductsResponse>("/products", { query: params, signal });
}

export function getProductRequest(id: string, signal?: AbortSignal) {
  return apiRequest<{ product: Product }>(`/products/${id}`, { signal });
}

export function listCategoriesRequest(signal?: AbortSignal) {
  return apiRequest<{ categories: string[] }>("/categories", { signal });
}
