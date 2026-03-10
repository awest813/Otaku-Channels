/**
 * Shared query-parameter validation helpers for Next.js API route handlers.
 *
 * All helpers accept a raw string (from URLSearchParams.get()) and return a
 * validated, range-clamped number. They never throw — invalid/missing input
 * returns undefined so callers can apply their own business-logic defaults.
 */

/**
 * Parse and clamp a page number (min 1, max 500).
 * Returns undefined when the parameter is absent, empty, or non-numeric.
 */
export function clampPage(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.min(n, 500);
}

/**
 * Parse and clamp a page-size limit (min 1, max 100).
 * Returns undefined when the parameter is absent, empty, or non-numeric.
 */
export function clampLimit(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.min(n, 100);
}

/** Parse and clamp a release year. Min 1900, max current year + 2. */
export function clampYear(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  const currentYear = new Date().getFullYear();
  if (!Number.isFinite(n) || n < 1900 || n > currentYear + 2) return undefined;
  return n;
}

/**
 * Clamp a search query string to a maximum length.
 * Returns undefined if the trimmed query is empty.
 */
export function sanitizeQuery(
  raw: string | null,
  maxLen = 200
): string | undefined {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}
