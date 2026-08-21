import { useQuery } from "@tanstack/react-query";
import { listOrdersRequest } from "../../../api/orders.api";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: ({ signal }) => listOrdersRequest(signal),
  });
}
