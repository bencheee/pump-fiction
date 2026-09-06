import type { FieldErrors } from "@/shared/application/operation-result";

/** A measurement type is a name; its unit is fixed to centimetres. */
export type MeasurementTypeDraft = Readonly<{ name: string }>;
export type MeasurementTypeRename = Readonly<{ id: string; name: string }>;

export type MeasurementEntryDraft = Readonly<{
  measurementTypeId: string;
  entryDate: string;
  valueCm: number;
}>;

export type MeasurementEntryEdit = Readonly<{
  id: string;
  entryDate: string;
  valueCm: number;
}>;

export type BodyValidation<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; fieldErrors: FieldErrors }>;

/** `measurement_entries.value_cm` is `numeric(7,2)`. */
export const maxValueCm = 99999.99;
export const maxTypeNameLength = 80;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const localDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validateMeasurementTypeName(
  input: unknown,
): BodyValidation<MeasurementTypeDraft> {
  if (!isRecord(input) || typeof input.name !== "string")
    return invalid("name", "Enter a name.");
  const name = input.name.trim();
  if (name === "") return invalid("name", "Enter a name.");
  if (name.length > maxTypeNameLength)
    return invalid("name", `Use at most ${maxTypeNameLength} characters.`);
  return { ok: true, value: { name } };
}

export function validateMeasurementTypeRename(
  input: unknown,
): BodyValidation<MeasurementTypeRename> {
  if (!isRecord(input) || !isUuid(input.id))
    return invalid("id", "Choose a measurement.");
  const draft = validateMeasurementTypeName(input);
  return draft.ok
    ? { ok: true, value: { id: input.id, ...draft.value } }
    : draft;
}

/**
 * Checks one measurement before it reaches the database, as `MVP-BOD-002`
 * requires: a real date that is not in the future, and a positive decimal
 * centimetre value the column can hold. Per-type-and-date uniqueness and the
 * future-date trigger remain database invariants behind these.
 */
export function validateMeasurementEntry(
  input: unknown,
  localDate: string,
): BodyValidation<MeasurementEntryDraft> {
  if (!isRecord(input) || !isUuid(input.measurementTypeId))
    return invalid("measurementTypeId", "Choose a measurement.");
  const values = validateEntryValues(input, localDate);
  return values.ok
    ? {
        ok: true,
        value: { measurementTypeId: input.measurementTypeId, ...values.value },
      }
    : values;
}

export function validateMeasurementEntryEdit(
  input: unknown,
  localDate: string,
): BodyValidation<MeasurementEntryEdit> {
  if (!isRecord(input) || !isUuid(input.id))
    return invalid("id", "Choose a measurement entry.");
  const values = validateEntryValues(input, localDate);
  return values.ok
    ? { ok: true, value: { id: input.id, ...values.value } }
    : values;
}

export function validateMeasurementId(input: unknown): BodyValidation<string> {
  return isUuid(input)
    ? { ok: true, value: input }
    : invalid("id", "Choose a measurement.");
}

function validateEntryValues(
  input: Record<string, unknown>,
  localDate: string,
): BodyValidation<Readonly<{ entryDate: string; valueCm: number }>> {
  if (!isLocalDate(input.entryDate))
    return invalid("entryDate", "Enter a valid date.");
  if (input.entryDate > localDate)
    return invalid("entryDate", "Choose today or an earlier date.");

  const valueCm = input.valueCm;
  if (typeof valueCm !== "number" || !Number.isFinite(valueCm) || valueCm <= 0)
    return invalid("valueCm", "Enter a measurement above zero.");
  if (valueCm > maxValueCm)
    return invalid("valueCm", `Enter a measurement below ${maxValueCm} cm.`);
  if (!hasAtMostTwoDecimals(valueCm))
    return invalid("valueCm", "Use at most two decimals.");

  return { ok: true, value: { entryDate: input.entryDate, valueCm } };
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
/** `84.2 * 100` is not exactly `8420` in binary floating point. */
function hasAtMostTwoDecimals(value: number): boolean {
  return Number.isInteger(Number((value * 100).toFixed(6)));
}
function invalid<T>(field: string, message: string): BodyValidation<T> {
  return { ok: false, fieldErrors: { [field]: [message] } };
}
