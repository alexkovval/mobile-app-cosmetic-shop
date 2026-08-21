import { Product } from "../types";
import { apiRequest } from "./client";

export interface ListProductsParams {
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
