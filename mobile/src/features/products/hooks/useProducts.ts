import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ListProductsParams, listProductsRequest } from "../../../api/products.api";

/**
 * Server state — belongs in React Query, not a local/UI store, precisely
 * because it needs caching, request de-duplication, and cancellation
 * (via the `signal` React Query passes through to the fetch client) rather
 * than being hand-rolled. See ARCHITECTURE_PLAN.md §6.
 */
export function useProducts(params: ListProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: ({ signal }) => listProductsRequest(params, signal),
    // Keep the previous page's items visible while the next page/filter
    // change is in flight, instead of flashing back to a loading skeleton.
    placeholderData: keepPreviousData,
  });
}
