import "server-only";

import { getAppSettings as runGetAppSettings } from "@/features/app-settings/application/get-app-settings";
import {
  updateAppTimeZone as runUpdateAppTimeZone,
  type UpdateAppTimeZoneInput,
} from "@/features/app-settings/application/update-app-time-zone";
import type { AppSettings } from "@/features/app-settings/domain/app-settings";
import { type OperationResult } from "@/shared/application/operation-result";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseAppSettingsRepository } from "../repositories/supabase-app-settings-repository";

export async function getAppSettings(): Promise<OperationResult<AppSettings>> {
  return runGetAppSettings(createRepository());
}

export async function updateAppTimeZone(
  input: UpdateAppTimeZoneInput,
): Promise<OperationResult<AppSettings>> {
  return runUpdateAppTimeZone(createRepository(), input);
}

function createRepository(): SupabaseAppSettingsRepository {
  return new SupabaseAppSettingsRepository(createServerDatabaseClient());
}
