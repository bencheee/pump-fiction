import type {
  MeasurementEntry,
  MeasurementType,
  StoredMeasurementType,
} from "../domain/body";
import type {
  MeasurementEntryDraft,
  MeasurementEntryEdit,
  MeasurementTypeDraft,
  MeasurementTypeRename,
} from "../domain/body-validation";

/**
 * Every measurement type with everything recorded for it, beside the date the
 * database considers today. One read serves both `S21` and `S23`, and every
 * derivation stays a pure function of what it returned.
 */
export type StoredBody = Readonly<{
  localDate: string;
  types: readonly StoredMeasurementType[];
}>;

export interface BodyRepository {
  list(): Promise<StoredBody>;
  /** Null when that type has no measurement on that local date. */
  getEntry(
    measurementTypeId: string,
    entryDate: string,
  ): Promise<MeasurementEntry | null>;
  createType(draft: MeasurementTypeDraft): Promise<MeasurementType>;
  renameType(rename: MeasurementTypeRename): Promise<MeasurementType>;
  removeType(id: string): Promise<void>;
  createEntry(draft: MeasurementEntryDraft): Promise<MeasurementEntry>;
  /**
   * Today records every measurement the day is missing in one action, so the
   * writes share one transaction: either the day is recorded or none of it is.
   */
  createEntries(
    drafts: readonly MeasurementEntryDraft[],
  ): Promise<readonly MeasurementEntry[]>;
  updateEntry(edit: MeasurementEntryEdit): Promise<MeasurementEntry>;
  removeEntry(id: string): Promise<void>;
}

export type BodyRepositoryErrorCode =
  | "duplicate_name"
  | "type_not_found"
  | "type_has_entries"
  | "duplicate_date"
  | "future_date"
  | "entry_not_found"
  | "constraint"
  | "unavailable"
  | "unexpected";

export class BodyRepositoryError extends Error {
  readonly code: BodyRepositoryErrorCode;

  constructor(code: BodyRepositoryErrorCode, options?: ErrorOptions) {
    super("Body repository operation failed", options);
    this.name = "BodyRepositoryError";
    this.code = code;
  }
}
