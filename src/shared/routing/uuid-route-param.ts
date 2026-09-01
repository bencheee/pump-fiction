import { notFound } from "next/navigation";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuidRouteParam(value: string): boolean {
  return uuidPattern.test(value);
}

export function requireUuidRouteParam(value: string): string {
  if (!isUuidRouteParam(value)) notFound();
  return value;
}
