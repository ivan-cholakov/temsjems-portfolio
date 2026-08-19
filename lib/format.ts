/**
 * Two-digit index label ("01", "02", ... ) as printed beside works, posts and
 * gallery details. Numbers past 99 keep their own width rather than truncate.
 */
export function indexLabel(n: number): string {
  return String(n).padStart(2, "0");
}
