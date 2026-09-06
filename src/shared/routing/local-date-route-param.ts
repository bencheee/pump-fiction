import { notFound } from "next/navigation";

const localDatePattern = /^\d{4}-\d{2}-\d{2}$/;

/** A real `YYYY-MM-DD` calendar date, so `2026-02-30` is not one. */
export function isLocalDateRouteParam(value: string): boolean {
  if (!localDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

/**
 * The date-keyed counterpart of `requireUuidRouteParam`: a weigh-in is
 * addressed by its local date, and a malformed one resolves through the shared
 * not-found boundary rather than through a query.
 */
export function requireLocalDateRouteParam(value: string): string {
  if (!isLocalDateRouteParam(value)) notFound();
  return value;
}
