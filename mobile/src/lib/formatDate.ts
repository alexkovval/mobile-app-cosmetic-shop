/** Short, locale-aware date for order history/detail screens (e.g. "Aug 21, 2026"). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
