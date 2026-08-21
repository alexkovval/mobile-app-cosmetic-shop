import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItemRequest } from "../../../api/cart.api";
import { Cart } from "../../../types";

interface UpdateVars {
  itemId: string;
  quantity: number;
}

/**
 * Optimistic update + rollback: the quantity stepper needs to feel instant,
 * so the cached cart is patched immediately, then reconciled with the
 * server's real response — or rolled back if the request fails (e.g. the
 * requested quantity exceeds current stock). Always invalidates on settle
 * so the cache can't drift from the server long-term even after a rollback.
 * See ARCHITECTURE_PLAN.md §6.
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: UpdateVars) => updateCartItemRequest(itemId, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      if (previousCart) {
        const items = previousCart.items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        queryClient.setQueryData<Cart>(["cart"], { items, subtotal });
      }

      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
