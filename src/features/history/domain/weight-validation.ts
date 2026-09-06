import type { FieldErrors } from "@/shared/application/operation-result";

/** The values a weigh-in is created or corrected with. */
export type WeightEntryDraft = Readonly<{
  entryDate: string;
  weightKg: number;
}>;

export type WeightEntryEdit = Readonly<{ id: string } & WeightEntryDraft>;

export type WeightValidation<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; fieldErrors: FieldErrors }>;

/** `weight_entries.weight_kg` is `numeric(6,2)`. */
export const maxWeightKg = 9999.99;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const localDatePattern = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Checks one weigh-in before it reaches the database. Per-date uniqueness and
 * the future-date trigger remain database invariants and the last line of
 * defense; this catches what a field error can explain, as `MVP-WGT-001`
 * requires: a real date that is not in the future, and a positive decimal
 * kilogram value the column can hold.
 */
export function validateWeightEntry(
  input: unknown,
  localDate: string,
): WeightValidation<WeightEntryDraft> {
  if (!isRecord(input))
    return invalid("entryDate", "Enter a date and a weight.");

  if (!isLocalDate(input.entryDate))
    return invalid("entryDate", "Enter a valid date.");
  if (input.entryDate > localDate)
    return invalid("entryDate", "Choose today or an earlier date.");

  const weightKg = input.weightKg;
  if (
    typeof weightKg !== "number" ||
    !Number.isFinite(weightKg) ||
    weightKg <= 0
  )
    return invalid("weightKg", "Enter a weight above zero.");
  if (weightKg > maxWeightKg)
    return invalid("weightKg", `Enter a weight below ${maxWeightKg} kg.`);
  if (!hasAtMostTwoDecimals(weightKg))
    return invalid("weightKg", "Use at most two decimals.");

  return { ok: true, value: { entryDate: input.entryDate, weightKg } };
}

export function validateWeightEntryEdit(
  input: unknown,
  localDate: string,
): WeightValidation<WeightEntryEdit> {
  if (!isRecord(input) || !isUuid(input.id))
    return invalid("id", "Choose a saved weigh-in.");
  const draft = validateWeightEntry(input, localDate);
  return draft.ok
    ? { ok: true, value: { id: input.id, ...draft.value } }
    : draft;
}

export function validateWeightEntryId(
  input: unknown,
): WeightValidation<string> {
  return isUuid(input)
    ? { ok: true, value: input }
    : invalid("id", "Choose a saved weigh-in.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}
function isLocalDate(value: unknown): value is string {
  if (typeof value !== "string" || !localDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
/** `82.4 * 100` is `8240.000000000001`, so the scale is rounded before the test. */
function hasAtMostTwoDecimals(value: number): boolean {
  return Number.isInteger(Number((value * 100).toFixed(6)));
}
function invalid<T>(field: string, message: string): WeightValidation<T> {
  return { ok: false, fieldErrors: { [field]: [message] } };
}
