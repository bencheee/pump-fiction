import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import {
  BodyRepositoryError,
  type BodyRepository,
  type BodyRepositoryErrorCode,
  type StoredBody,
} from "@/features/history/application/body-repository";
import type {
  MeasurementEntry,
  MeasurementType,
} from "@/features/history/domain/body";
import type {
  MeasurementEntryDraft,
  MeasurementEntryEdit,
  MeasurementTypeDraft,
  MeasurementTypeRename,
} from "@/features/history/domain/body-validation";
import type { ServerDatabaseClient } from "@/server/database/client";

export class SupabaseBodyRepository implements BodyRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async list(): Promise<StoredBody> {
    return this.run(async () => {
      const { data, error } = await this.client.rpc("list_body_measurements");
      if (error) throw mapPostgrestError(error);
      return data as unknown as StoredBody;
    });
  }

  async getEntry(
    measurementTypeId: string,
    entryDate: string,
  ): Promise<MeasurementEntry | null> {
    return this.run(async () => {
      const { data, error } = await this.client.rpc("get_measurement_entry", {
        p_measurement_type_id: measurementTypeId,
        p_entry_date: entryDate,
      });
      if (error) throw mapPostgrestError(error);
      return data as unknown as MeasurementEntry | null;
    });
  }

  async createType(draft: MeasurementTypeDraft): Promise<MeasurementType> {
    return this.run(async () => {
      const { data, error } = await this.client.rpc("create_measurement_type", {
        p_name: draft.name,
      });
      if (error) throw mapPostgrestError(error);
      return data as unknown as MeasurementType;
    });
  }

  async renameType(rename: MeasurementTypeRename): Promise<MeasurementType> {
    return this.run(async () => {
      const { data, error } = await this.client.rpc("rename_measurement_type", {
        p_id: rename.id,
        p_name: rename.name,
      });
      if (error) throw mapPostgrestError(error);
      return data as unknown as MeasurementType;
    });
  }

  async removeType(id: string): Promise<void> {
    await this.run(async () => {
      const { error } = await this.client.rpc("delete_measurement_type", {
        p_id: id,
      });
      if (error) throw mapPostgrestError(error);
      return null;
    });
  }

  async createEntry(draft: MeasurementEntryDraft): Promise<MeasurementEntry> {
    return this.run(async () => {
      const { data, error } = await this.client.rpc(
        "create_measurement_entry",
        {
          p_measurement_type_id: draft.measurementTypeId,
          p_entry_date: draft.entryDate,
          p_value_cm: draft.valueCm,
        },
      );
      if (error) throw mapPostgrestError(error);
      return data as unknown as MeasurementEntry;
    });
  }

  async updateEntry(edit: MeasurementEntryEdit): Promise<MeasurementEntry> {
    return this.run(async () => {
      const { data, error } = await this.client.rpc(
        "update_measurement_entry",
        {
          p_id: edit.id,
          p_entry_date: edit.entryDate,
          p_value_cm: edit.valueCm,
        },
      );
      if (error) throw mapPostgrestError(error);
      return data as unknown as MeasurementEntry;
    });
  }

  async removeEntry(id: string): Promise<void> {
    await this.run(async () => {
      const { error } = await this.client.rpc("delete_measurement_entry", {
        p_id: id,
      });
      if (error) throw mapPostgrestError(error);
      return null;
    });
  }

  private async run<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw error instanceof BodyRepositoryError
        ? error
        : new BodyRepositoryError("unavailable", { cause: error });
    }
  }
}

function mapPostgrestError(error: PostgrestError): BodyRepositoryError {
  const mapping: Readonly<Record<string, BodyRepositoryErrorCode>> = {
    PF401: "duplicate_name",
    PF402: "constraint",
    PF403: "type_not_found",
    PF404: "type_has_entries",
    PF405: "future_date",
    PF406: "constraint",
    PF407: "duplicate_date",
    PF408: "entry_not_found",
    // The unique indexes on the type name and on the type-and-date pair, and
    // the restricted reference, reached only if two writes race the checks.
    "23505": "duplicate_date",
    "23503": "type_has_entries",
    // `reject_future_local_entry_date` raises without a code of its own, and it
    // is the only unnamed raise these functions can reach.
    P0001: "future_date",
  };
  return new BodyRepositoryError(
    mapping[error.code] ??
      (error.code.startsWith("22") || error.code.startsWith("23")
        ? "constraint"
        : "unexpected"),
    { cause: error },
  );
}
