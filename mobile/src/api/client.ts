import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "../state/authStore";
import { ApiError } from "../lib/errors";

const CONFIGURED_API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "http://localhost:4000";

// The Android emulator runs in its own network namespace: "localhost" from
// its point of view is the emulator itself, not your Mac, so a backend
// running on your machine at localhost:4000 is unreachable under that name.
// 10.0.2.2 is the emulator's fixed alias back to the host machine. This only
// applies to the Android EMULATOR — a physical Android/iOS device instead
// needs your machine's real LAN IP, set via EXPO_PUBLIC_API_URL in .env.
// The iOS Simulator shares the host's network directly, so localhost works
// there unmodified.
const API_URL =
  Platform.OS === "android" && CONFIGURED_API_URL.includes("localhost")
    ? CONFIGURED_API_URL.replace("localhost", "10.0.2.2")
    : CONFIGURED_API_URL;

const DEFAULT_TIMEOUT_MS = 10_000;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip attaching the Authorization header (register/login only). */
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path, API_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * The ONLY place in the app that calls fetch. Every screen/hook goes
 * through this (via the per-feature api modules), so auth-header injection,
 * timeouts, and error normalization all happen in exactly one place.
 * See ARCHITECTURE_PLAN.md §1 and §9.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, headers, signal, skipAuth } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  // Let an externally-passed signal (e.g. from React Query, or a debounced
  // search) also abort this request — whichever fires first wins.
  const externalAbort = () => controller.abort();
  signal?.addEventListener("abort", externalAbort);

  const token = skipAuth ? null : useAuthStore.getState().token;

  try {
    const res = await fetch(buildUrl(path, query), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      // No/invalid JSON body (e.g. a 204) — fine for successful responses.
    }

    if (!res.ok) {
      const errBody = json as { error?: { code?: string; message?: string; details?: unknown } } | null;
      const message = errBody?.error?.message ?? `Request failed with status ${res.status}`;
      const details = errBody?.error?.details;

      if (res.status === 401) throw new ApiError("unauthorized", message, res.status, details);
      if (res.status === 404) throw new ApiError("not_found", message, res.status, details);
      if (res.status === 409) throw new ApiError("conflict", message, res.status, details);
      if (res.status === 400 || res.status === 422)
        throw new ApiError("validation", message, res.status, details);
      throw new ApiError("server", message, res.status, details);
    }

    return json as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("timeout", "The request took too long or was cancelled.");
    }
    throw new ApiError("network", "Couldn't reach the server.");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", externalAbort);
  }
}
