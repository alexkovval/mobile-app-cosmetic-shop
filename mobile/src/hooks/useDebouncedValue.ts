import { useEffect, useState } from "react";

/**
 * Debounces a fast-changing value (typically search input) by `delayMs`
 * before it's used as a query parameter — avoids firing a network request
 * on every keystroke. Paired with AbortController cancellation in
 * src/api/client.ts (via React Query's `signal`), so a fast typist never
 * piles up stale in-flight requests. See ARCHITECTURE_PLAN.md §9.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
