import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";
import type { ChartRange, ChartSeries } from "../domain/chart";
import {
  weightOverview,
  weightSeries,
  type WeightEntry,
  type WeightOverview,
} from "../domain/weight";
import {
  validateWeightEntry,
  validateWeightEntryEdit,
  validateWeightEntryId,
  type WeightValidation,
} from "../domain/weight-validation";
import {
  WeightRepositoryError,
  type WeightRepository,
} from "./weight-repository";

/** Everything `S19` renders. */
export type WeightProgress = Readonly<{
  overview: WeightOverview;
  series: ChartSeries;
}>;

/**
 * The range the chart opens on. A month shows the trend the weekly averages
 * are for while still naming individual weigh-ins; `S19` offers week, month,
 * quarter, and year beside it.
 */
export const defaultWeightRange: ChartRange = "month";

export async function getWeightProgress(
  repository: WeightRepository,
  options: Readonly<{ range?: ChartRange }> = {},
): Promise<OperationResult<WeightProgress>> {
  let stored;
  try {
    stored = await repository.getOverview();
  } catch {
    return persistence("We couldn't load your weight history. Try again.");
  }
  return operationSuccess({
    overview: weightOverview(stored.entries, stored.localDate),
    series: weightSeries(
      stored.entries,
      options.range ?? defaultWeightRange,
      stored.localDate,
    ),
  });
}

/** The weigh-in `S20` edits. */
export async function getWeightEntry(
  repository: WeightRepository,
  entryDate: string,
): Promise<OperationResult<WeightEntry>> {
  let entry: WeightEntry | null;
  try {
    entry = await repository.getByDate(entryDate);
  } catch {
    return persistence("We couldn't load that weigh-in. Try again.");
  }
  return entry === null
    ? operationFailure({
        code: "not_found",
        message: "That date has no weigh-in.",
        retryable: false,
      })
    : operationSuccess(entry);
}

/**
 * Today's weigh-in and the local date it belongs to, for the `MVP-TOD-004`
 * prompt. The entry is null exactly while Today may still offer to create one.
 */
export async function getTodayWeight(
  repository: WeightRepository,
): Promise<
  OperationResult<Readonly<{ localDate: string; entry: WeightEntry | null }>>
> {
  try {
    const stored = await repository.getOverview();
    return operationSuccess({
      localDate: stored.localDate,
      entry:
        stored.entries.find((entry) => entry.entryDate === stored.localDate) ??
        null,
    });
  } catch {
    return persistence("We couldn't load today's weight. Try again.");
  }
}

export async function createWeightEntry(
  repository: WeightRepository,
  input: unknown,
): Promise<OperationResult<WeightEntry>> {
  let localDate: string;
  try {
    localDate = (await repository.getOverview()).localDate;
  } catch {
    return persistence("We couldn't save the weigh-in. Try again.");
  }
  const validation = validateWeightEntry(input, localDate);
  if (!validation.ok) return validationFailure(validation);
  try {
    return operationSuccess(await repository.create(validation.value));
  } catch (error) {
    return writeFailure(error);
  }
}

export async function updateWeightEntry(
  repository: WeightRepository,
  input: unknown,
): Promise<OperationResult<WeightEntry>> {
  let localDate: string;
  try {
    localDate = (await repository.getOverview()).localDate;
  } catch {
    return persistence("We couldn't save the weigh-in. Try again.");
  }
  const validation = validateWeightEntryEdit(input, localDate);
  if (!validation.ok) return validationFailure(validation);
  try {
    return operationSuccess(await repository.update(validation.value));
  } catch (error) {
    return writeFailure(error);
  }
}

export async function deleteWeightEntry(
  repository: WeightRepository,
  input: unknown,
): Promise<OperationResult<null>> {
  const validation = validateWeightEntryId(input);
  if (!validation.ok) return validationFailure(validation);
  try {
    await repository.remove(validation.value);
    return operationSuccess(null);
  } catch (error) {
    return writeFailure(error);
  }
}

function validationFailure<T>(
  validation: Extract<WeightValidation<unknown>, { ok: false }>,
): OperationResult<T> {
  return operationFailure({
    code: "validation",
    message: "Check the weigh-in and try again.",
    retryable: false,
    fieldErrors: validation.fieldErrors,
  });
}

/**
 * A refused write is the user's to correct, not the network's to retry, so a
 * duplicate date, a future date, and a rejected value all become field errors.
 */
function writeFailure<T>(error: unknown): OperationResult<T> {
  if (error instanceof WeightRepositoryError) {
    if (error.code === "duplicate_date")
      return fieldFailure("entryDate", "That date already has a weigh-in.");
    if (error.code === "future_date")
      return fieldFailure("entryDate", "Choose today or an earlier date.");
    if (error.code === "constraint")
      return fieldFailure("weightKg", "Enter a weight above zero.");
    if (error.code === "not_found")
      return operationFailure({
        code: "not_found",
        message: "That weigh-in is no longer in your history.",
        retryable: false,
      });
  }
  return persistence("We couldn't save the weigh-in. Try again.");
}

function fieldFailure<T>(field: string, message: string): OperationResult<T> {
  return operationFailure({
    code: "validation",
    message: "Check the weigh-in and try again.",
    retryable: false,
    fieldErrors: { [field]: [message] },
  });
}

function persistence<T>(message: string): OperationResult<T> {
  return operationFailure({ code: "persistence", message, retryable: true });
}
