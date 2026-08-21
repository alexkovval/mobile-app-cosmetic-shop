import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "./errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Transient network blips are common on mobile — retry GETs twice with
      // backoff. Never retry a 401 (unauthorized) or 404 — those won't
      // change on retry and just waste time before the error state shows.
      retry: (failureCount, error) => {
        if (isApiError(error) && (error.kind === "unauthorized" || error.kind === "not_found")) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      staleTime: 30_000,
    },
    mutations: {
      // Mutations (POST/PATCH/DELETE) never auto-retry: a retried write can
      // double-submit if the first attempt actually succeeded but the
      // response was lost. Order creation in particular relies on this —
      // see ARCHITECTURE_PLAN.md §7. Any retry there is an explicit,
      // user-initiated action that reuses the same idempotency key.
      retry: false,
    },
  },
});
