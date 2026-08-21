/**
 * Every response from src/api/client.ts is normalized into one of these
 * before it ever reaches a screen or a React Query hook — see
 * ARCHITECTURE_PLAN.md §9. No screen should ever branch on a raw HTTP
 * status code or a fetch-thrown TypeError.
 */
export type ApiErrorKind = "network" | "timeout" | "validation" | "unauthorized" | "server" | "not_found" | "conflict";

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  details?: unknown;

  constructor(kind: ApiErrorKind, message: string, status?: number, details?: unknown) {
    super(message);
    this.kind = kind;
    this.status = status;
    this.details = details;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

/** Friendly, screen-ready copy for a caught ApiError. */
export function apiErrorMessage(err: unknown): string {
  if (isApiError(err)) {
    switch (err.kind) {
      case "network":
        return "Couldn't reach the server. Check your connection and try again.";
      case "timeout":
        return "That took too long to respond. Please try again.";
      case "unauthorized":
        return "Your session has expired. Please log in again.";
      case "not_found":
        return "We couldn't find that.";
      case "conflict":
        return err.message || "That already exists.";
      case "validation":
        return err.message || "Please check the form and try again.";
      case "server":
      default:
        return "Something went wrong on our end. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
