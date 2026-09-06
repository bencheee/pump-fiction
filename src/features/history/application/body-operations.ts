import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";
import {
  measurementDetail,
  measurementSeries,
  measurementSummaries,
  todayMeasurements,
  type MeasurementDetail,
  type MeasurementEntry,
  type MeasurementSummary,
  type MeasurementType,
  type TodayMeasurements,
} from "../domain/body";
import type { MeasurementEntryDraft } from "../domain/body-validation";
import {
  validateMeasurementEntry,
  validateMeasurementEntryEdit,
  validateMeasurementId,
  validateMeasurementTypeName,
  validateMeasurementTypeRename,
  type BodyValidation,
} from "../domain/body-validation";
import type { ChartRange, ChartSeries } from "../domain/chart";
import { BodyRepositoryError, type BodyRepository } from "./body-repository";

/** Everything `S21` renders. */
export type BodyMeasurements = Readonly<{
  localDate: string;
  measurements: readonly MeasurementSummary[];
}>;

/** Everything `S23` renders. */
export type MeasurementProgress = Readonly<{
  localDate: string;
  detail: MeasurementDetail;
  series: ChartSeries;
}>;

/**
 * The range the chart opens on. A measurement is taken every few weeks at
 * most, so its whole history is what tells the story; `S23` offers month,
 * quarter, and year beside it.
 */
export const defaultMeasurementRange: ChartRange = "all";

export async function listBodyMeasurements(
  repository: BodyRepository,
): Promise<OperationResult<BodyMeasurements>> {
  try {
    const stored = await repository.list();
    return operationSuccess({
      localDate: stored.localDate,
      measurements: measurementSummaries(stored.types),
    });
  } catch {
    return persistence("We couldn't load your measurements. Try again.");
  }
}

export async function getMeasurementProgress(
  repository: BodyRepository,
  measurementTypeId: string,
  options: Readonly<{ range?: ChartRange }> = {},
): Promise<OperationResult<MeasurementProgress>> {
  let stored;
  try {
    stored = await repository.list();
  } catch {
    return persistence("We couldn't load that measurement. Try again.");
  }
  const type = stored.types.find((entry) => entry.id === measurementTypeId);
  if (!type) return notFound("That measurement is no longer in your list.");
  return operationSuccess({
    localDate: stored.localDate,
    detail: measurementDetail(type),
    series: measurementSeries(
      type.entries,
      options.range ?? defaultMeasurementRange,
      stored.localDate,
    ),
  });
}

/** The measurement `S24` edits. */
export async function getMeasurementEntry(
  repository: BodyRepository,
  measurementTypeId: string,
  entryDate: string,
): Promise<OperationResult<MeasurementEntry>> {
  let entry: MeasurementEntry | null;
  try {
    entry = await repository.getEntry(measurementTypeId, entryDate);
  } catch {
    return persistence("We couldn't load that measurement. Try again.");
  }
  return entry === null
    ? notFound("That date has no measurement.")
    : operationSuccess(entry);
}

export async function createMeasurementType(
  repository: BodyRepository,
  input: unknown,
): Promise<OperationResult<MeasurementType>> {
  const validation = validateMeasurementTypeName(input);
  if (!validation.ok) return validationFailure(validation);
  try {
    return operationSuccess(await repository.createType(validation.value));
  } catch (error) {
    return writeFailure(error);
  }
}

export async function renameMeasurementType(
  repository: BodyRepository,
  input: unknown,
): Promise<OperationResult<MeasurementType>> {
  const validation = validateMeasurementTypeRename(input);
  if (!validation.ok) return validationFailure(validation);
  try {
    return operationSuccess(await repository.renameType(validation.value));
  } catch (error) {
    return writeFailure(error);
  }
}

export async function deleteMeasurementType(
  repository: BodyRepository,
  input: unknown,
): Promise<OperationResult<null>> {
  const validation = validateMeasurementId(input);
  if (!validation.ok) return validationFailure(validation);
  try {
    await repository.removeType(validation.value);
    return operationSuccess(null);
  } catch (error) {
    return writeFailure(error);
  }
}

export async function createMeasurementEntry(
  repository: BodyRepository,
  input: unknown,
): Promise<OperationResult<MeasurementEntry>> {
  const localDate = await readLocalDate(repository);
  if (localDate === null)
    return persistence("We couldn't save the measurement. Try again.");
  const validation = validateMeasurementEntry(input, localDate);
  if (!validation.ok) return validationFailure(validation);
  try {
    return operationSuccess(await repository.createEntry(validation.value));
  } catch (error) {
    return writeFailure(error);
  }
}

/**
 * `MVP-TOD-005`. Today's card sends one value per measurement the day is
 * missing, and they are written in one transaction. A refusal names the
 * measurement it belongs to, so the user is not left to work out which value
 * of several the database objected to.
 */
export async function getTodayMeasurements(
  repository: BodyRepository,
): Promise<OperationResult<TodayMeasurements>> {
  try {
    const stored = await repository.list();
    return operationSuccess(
      todayMeasurements(stored.localDate, measurementSummaries(stored.types)),
    );
  } catch {
    return persistence("We couldn't load your measurements. Try again.");
  }
}

export async function createTodayMeasurementEntries(
  repository: BodyRepository,
  input: unknown,
): Promise<OperationResult<readonly MeasurementEntry[]>> {
  const localDate = await readLocalDate(repository);
  if (localDate === null)
    return persistence("We couldn't save the measurements. Try again.");

  const entries = Array.isArray(input) ? input : null;
  if (entries === null || entries.length === 0)
    return operationFailure({
      code: "validation",
      message: "Enter at least one measurement.",
      retryable: false,
    });

  const drafts: MeasurementEntryDraft[] = [];
  const fieldErrors: Record<string, string[]> = {};
  for (const entry of entries) {
    const candidate = entry as { measurementTypeId?: unknown };
    const result = validateMeasurementEntry(
      { ...(entry as object), entryDate: localDate },
      localDate,
    );
    if (result.ok) {
      drafts.push(result.value);
      continue;
    }
    // The card keeps one field per measurement, so a refusal is reported
    // against the measurement it came from rather than against the form.
    const id = String(candidate.measurementTypeId ?? "");
    const messages = Object.values(result.fieldErrors).flat();
    fieldErrors[id] =
      messages.length > 0 ? messages : ["Check this measurement."];
  }

  if (Object.keys(fieldErrors).length > 0)
    return operationFailure({
      code: "validation",
      message: "Check the measurements and try again.",
      retryable: false,
      fieldErrors,
    });

  try {
    return operationSuccess(await repository.createEntries(drafts));
  } catch (error) {
    return writeFailure(error);
  }
}

export async function updateMeasurementEntry(
  repository: BodyRepository,
  input: unknown,
): Promise<OperationResult<MeasurementEntry>> {
  const localDate = await readLocalDate(repository);
  if (localDate === null)
    return persistence("We couldn't save the measurement. Try again.");
  const validation = validateMeasurementEntryEdit(input, localDate);
  if (!validation.ok) return validationFailure(validation);
  try {
    return operationSuccess(await repository.updateEntry(validation.value));
  } catch (error) {
    return writeFailure(error);
  }
}

export async function deleteMeasurementEntry(
  repository: BodyRepository,
  input: unknown,
): Promise<OperationResult<null>> {
  const validation = validateMeasurementId(input);
  if (!validation.ok) return validationFailure(validation);
  try {
    await repository.removeEntry(validation.value);
    return operationSuccess(null);
  } catch (error) {
    return writeFailure(error);
  }
}

async function readLocalDate(
  repository: BodyRepository,
): Promise<string | null> {
  try {
    return (await repository.list()).localDate;
  } catch {
    return null;
  }
}

function validationFailure<T>(
  validation: Extract<BodyValidation<unknown>, { ok: false }>,
): OperationResult<T> {
  return operationFailure({
    code: "validation",
    message: "Check the measurement and try again.",
    retryable: false,
    fieldErrors: validation.fieldErrors,
  });
}

/**
 * A refused write is the user's to correct, not the network's to retry. The
 * one exception is a type that still holds entries: nothing the form can change
 * makes that legal, so it reads as the explanation `MVP-BOD-001` gives.
 */
function writeFailure<T>(error: unknown): OperationResult<T> {
  if (error instanceof BodyRepositoryError) {
    if (error.code === "duplicate_name")
      return fieldFailure(
        "name",
        "Another measurement already uses this name.",
      );
    if (error.code === "duplicate_date")
      return fieldFailure("entryDate", "That date already has a measurement.");
    if (error.code === "future_date")
      return fieldFailure("entryDate", "Choose today or an earlier date.");
    if (error.code === "constraint")
      return fieldFailure("valueCm", "Enter a measurement above zero.");
    if (error.code === "type_has_entries")
      return operationFailure({
        code: "conflict",
        message:
          "This measurement has entries, and they are its only record. Delete them first if you really want it gone.",
        retryable: false,
      });
    if (error.code === "type_not_found")
      return notFound("That measurement is no longer in your list.");
    if (error.code === "entry_not_found")
      return notFound("That measurement entry is no longer recorded.");
  }
  return persistence("We couldn't save the measurement. Try again.");
}

function fieldFailure<T>(field: string, message: string): OperationResult<T> {
  return operationFailure({
    code: "validation",
    message: "Check the measurement and try again.",
    retryable: false,
    fieldErrors: { [field]: [message] },
  });
}

function notFound<T>(message: string): OperationResult<T> {
  return operationFailure({ code: "not_found", message, retryable: false });
}

function persistence<T>(message: string): OperationResult<T> {
  return operationFailure({ code: "persistence", message, retryable: true });
}
