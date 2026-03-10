const MAX_PAGE = 500;
const MAX_LIMIT = 100;
const MIN_YEAR = 1900;
const MAX_QUERY_LENGTH = 200;

export function sanitizeQuery(value: string | null): string | undefined {
  if (value === null) return undefined;
  return value.trim().slice(0, MAX_QUERY_LENGTH);
}

export function clampPage(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(Math.floor(parsed), 1), MAX_PAGE);
}

export function clampLimit(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(Math.floor(parsed), 1), MAX_LIMIT);
}

export function clampYear(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  const maxYear = new Date().getFullYear() + 2;
  return Math.min(Math.max(Math.floor(parsed), MIN_YEAR), maxYear);
}
