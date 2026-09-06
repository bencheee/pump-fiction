import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import {
  WeightRepositoryError,
  type StoredWeight,
  type WeightRepository,
  type WeightRepositoryErrorCode,
} from "@/features/history/application/weight-repository";
import type { WeightEntry } from "@/features/history/domain/weight";
import type {
  WeightEntryDraft,
  WeightEntryEdit,
} from "@/features/history/domain/weight-validation";
import type { ServerDatabaseClient } from "@/server/database/client";

export class SupabaseWeightRepository implements WeightRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async getOverview(): Promise<StoredWeight> {
    try {
      const { data, error } = await this.client.rpc("get_weight_overview");
      if (error) throw mapPostgrestError(error);
      return data as unknown as StoredWeight;
    } catch (error) {
      throw normalize(error);
    }
  }

  async getByDate(entryDate: string): Promise<WeightEntry | null> {
    try {
      const { data, error } = await this.client.rpc("get_weight_entry", {
        p_entry_date: entryDate,
      });
      if (error) throw mapPostgrestError(error);
      return data as unknown as WeightEntry | null;
    } catch (error) {
      throw normalize(error);
    }
  }

  async create(draft: WeightEntryDraft): Promise<WeightEntry> {
    try {
      const { data, error } = await this.client.rpc("create_weight_entry", {
        p_entry_date: draft.entryDate,
        p_weight_kg: draft.weightKg,
      });
      if (error) throw mapPostgrestError(error);
      return data as unknown as WeightEntry;
    } catch (error) {
      throw normalize(error);
    }
  }

  async update(edit: WeightEntryEdit): Promise<WeightEntry> {
    try {
      const { data, error } = await this.client.rpc("update_weight_entry", {
        p_id: edit.id,
        p_entry_date: edit.entryDate,
        p_weight_kg: edit.weightKg,
      });
      if (error) throw mapPostgrestError(error);
      return data as unknown as WeightEntry;
    } catch (error) {
      throw normalize(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const { error } = await this.client.rpc("delete_weight_entry", {
        p_id: id,
      });
      if (error) throw mapPostgrestError(error);
    } catch (error) {
      throw normalize(error);
    }
  }
}

function mapPostgrestError(error: PostgrestError): WeightRepositoryError {
  const mapping: Readonly<Record<string, WeightRepositoryErrorCode>> = {
    PF301: "duplicate_date",
    PF302: "future_date",
    PF303: "not_found",
    PF304: "constraint",
    // The per-date unique index, reached only if two writes race the check.
    "23505": "duplicate_date",
    // `reject_future_local_entry_date` raises without a code of its own, and
    // it is the only unnamed raise these five functions can reach.
    P0001: "future_date",
  };
  return new WeightRepositoryError(
    mapping[error.code] ??
      (error.code.startsWith("22") || error.code.startsWith("23")
        ? "constraint"
        : "unexpected"),
    { cause: error },
  );
}

function normalize(error: unknown): WeightRepositoryError {
  return error instanceof WeightRepositoryError
    ? error
    : new WeightRepositoryError("unavailable", { cause: error });
}
