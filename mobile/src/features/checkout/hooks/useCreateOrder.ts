import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateOrderInput, createOrderRequest } from "../../../api/orders.api";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrderRequest(input),
    // Never auto-retry a mutation that creates a resource — a retry after a
    // real failure should be one explicit, user-initiated tap (which reuses
    // the same idempotency key from CheckoutScreen), not something React
    // Query does silently behind a fixed backoff. See ARCHITECTURE_PLAN.md §7.
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
