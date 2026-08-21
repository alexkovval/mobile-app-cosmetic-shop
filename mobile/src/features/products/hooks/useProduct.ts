import { useQuery } from "@tanstack/react-query";
import { getProductRequest } from "../../../api/products.api";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: ({ signal }) => getProductRequest(id, signal),
    enabled: !!id,
  });
}
