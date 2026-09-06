import type { WeightEntry } from "../domain/weight";
import type {
  WeightEntryDraft,
  WeightEntryEdit,
} from "../domain/weight-validation";

/**
 * The stored weigh-ins beside the date the database considers today. The local
 * date travels with the entries so every derivation stays a pure function of
 * what one read returned, rather than of the server's clock.
 */
export type StoredWeight = Readonly<{
  localDate: string;
  entries: readonly WeightEntry[];
}>;

export interface WeightRepository {
  /** Every weigh-in and the configured local date. */
  getOverview(): Promise<StoredWeight>;
  /** Null when that local date holds no weigh-in. */
  getByDate(entryDate: string): Promise<WeightEntry | null>;
  create(draft: WeightEntryDraft): Promise<WeightEntry>;
  update(edit: WeightEntryEdit): Promise<WeightEntry>;
  remove(id: string): Promise<void>;
}

export type WeightRepositoryErrorCode =
  | "duplicate_date"
  | "future_date"
  | "not_found"
  | "constraint"
  | "unavailable"
  | "unexpected";

export class WeightRepositoryError extends Error {
  readonly code: WeightRepositoryErrorCode;

  constructor(code: WeightRepositoryErrorCode, options?: ErrorOptions) {
    super("Weight repository operation failed", options);
    this.name = "WeightRepositoryError";
    this.code = code;
  }
}
