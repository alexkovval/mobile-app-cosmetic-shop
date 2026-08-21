import { useQuery } from "@tanstack/react-query";
import { listCategoriesRequest } from "../../../api/products.api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => listCategoriesRequest(signal),
    // Categories change rarely relative to products — a longer staleTime
    // avoids a redundant refetch every time this screen regains focus.
    staleTime: 5 * 60_000,
  });
}
