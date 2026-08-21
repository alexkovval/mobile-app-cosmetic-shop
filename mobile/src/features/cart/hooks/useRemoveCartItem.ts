import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCartItemRequest } from "../../../api/cart.api";
import { Cart } from "../../../types";

/** Same optimistic-update + rollback-on-error pattern as useUpdateCartItem.ts. */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItemRequest(itemId),
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      if (previousCart) {
        const items = previousCart.items.filter((item) => item.id !== itemId);
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        queryClient.setQueryData<Cart>(["cart"], { items, subtotal });
      }

      return { previousCart };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
