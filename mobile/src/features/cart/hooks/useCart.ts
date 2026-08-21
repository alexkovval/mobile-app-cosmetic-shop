import { useQuery } from "@tanstack/react-query";
import { getCartRequest } from "../../../api/cart.api";

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: ({ signal }) => getCartRequest(signal),
  });
}
