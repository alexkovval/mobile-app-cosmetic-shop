/** Formats integer cents (matching the backend's money representation) as a display string. */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
