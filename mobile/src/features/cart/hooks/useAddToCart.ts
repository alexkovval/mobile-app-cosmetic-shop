import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCartItemRequest } from "../../../api/cart.api";
import { Cart } from "../../../types";

/**
 * Shared between ProductDetailScreen (Phase 6) and CartScreen (Phase 7) —
 * built once here rather than duplicated. Seeds the ["cart"] query cache
 * directly with the server's response instead of just invalidating, since
 * the create-cart-item endpoint already returns the fresh cart — avoids an
 * extra round trip. CartScreen's own hooks (Phase 7) read from this same key.
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItemRequest,
    onSuccess: (cart: Cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
}
