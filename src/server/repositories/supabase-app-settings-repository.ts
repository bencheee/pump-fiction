import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import {
  RepositoryError,
  type AppSettingsRepository,
  type RepositoryErrorCode,
} from "@/features/app-settings/application/app-settings-repository";
import type { AppSettings } from "@/features/app-settings/domain/app-settings";
import type { ServerDatabaseClient } from "@/server/database/client";
import type { Tables } from "@/server/database/database.types";

type AppSettingsRow = Tables<"app_settings">;

const appSettingsColumns = "time_zone, weight_unit, measurement_unit" as const;

export class SupabaseAppSettingsRepository implements AppSettingsRepository {
  constructor(private readonly client: ServerDatabaseClient) {}

  async get(): Promise<AppSettings> {
    try {
      const { data, error } = await this.client
        .from("app_settings")
        .select(appSettingsColumns)
        .eq("id", 1)
        .single();

      if (error) {
        throw mapPostgrestError(error);
      }

      return mapAppSettings(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }

  async updateTimeZone(timeZone: string): Promise<AppSettings> {
    try {
      const { data, error } = await this.client
        .from("app_settings")
        .update({ time_zone: timeZone })
        .eq("id", 1)
        .select(appSettingsColumns)
        .single();

      if (error) {
        throw mapPostgrestError(error);
      }

      return mapAppSettings(data);
    } catch (error) {
      throw normalizeRepositoryError(error);
    }
  }
}

function mapAppSettings(
  row: Pick<AppSettingsRow, "measurement_unit" | "time_zone" | "weight_unit">,
): AppSettings {
  if (row.weight_unit !== "kg" || row.measurement_unit !== "cm") {
    throw new RepositoryError("unexpected");
  }

  return {
    timeZone: row.time_zone,
    weightUnit: row.weight_unit,
    measurementUnit: row.measurement_unit,
  };
}

function mapPostgrestError(error: PostgrestError): RepositoryError {
  return new RepositoryError(mapPostgrestCode(error.code), { cause: error });
}

function mapPostgrestCode(code: string): RepositoryErrorCode {
  if (code === "PGRST116") {
    return "not_found";
  }

  if (code === "23505" || code === "409") {
    return "conflict";
  }

  if (code.startsWith("22") || code.startsWith("23") || code === "P0001") {
    return "constraint";
  }

  return "unexpected";
}

function normalizeRepositoryError(error: unknown): RepositoryError {
  if (error instanceof RepositoryError) {
    return error;
  }

  return new RepositoryError("unavailable", { cause: error });
}
