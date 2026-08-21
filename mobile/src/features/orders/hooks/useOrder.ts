import { useQuery } from "@tanstack/react-query";
import { getOrderRequest } from "../../../api/orders.api";

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: ({ signal }) => getOrderRequest(orderId, signal),
  });
}
