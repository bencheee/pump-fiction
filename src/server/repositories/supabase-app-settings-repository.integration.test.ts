import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/server/database/database.types";

import { SupabaseAppSettingsRepository } from "./supabase-app-settings-repository";

describe("SupabaseAppSettingsRepository", () => {
  it("reads and atomically updates the singleton as a domain shape", async () => {
    const url = requireEnvironment("SUPABASE_URL");
    const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
    const repository = new SupabaseAppSettingsRepository(
      createClient<Database>(url, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      }),
    );

    const before = await repository.get();
    const after = await repository.updateTimeZone(before.timeZone);

    expect(after).toEqual(before);
    expect(after).toEqual({
      timeZone: "Europe/Zagreb",
      weightUnit: "kg",
      measurementUnit: "cm",
    });
  });
});

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for repository integration tests.`);
  }
  return value;
}
