import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { WeightRepositoryError } from "@/features/history/application/weight-repository";
import type { Database } from "@/server/database/database.types";
import { SupabaseWeightRepository } from "./supabase-weight-repository";

// A weigh-in is unique per local date, so these fixtures sit far in the past
// where they cannot collide with a real one, and the suite removes them again.
const fixtureFrom = "2018-03-01";
const fixtureTo = "2018-03-31";

describe("SupabaseWeightRepository", () => {
  it("stores, reads, corrects, and removes a weigh-in", async () => {
    const client = createClient<Database>(
      requireEnvironment("SUPABASE_URL"),
      requireEnvironment("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );
    const weight = new SupabaseWeightRepository(client);

    try {
      await client
        .from("weight_entries")
        .delete()
        .gte("entry_date", fixtureFrom)
        .lte("entry_date", fixtureTo);

      const overview = await weight.getOverview();
      expect(overview.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Array.isArray(overview.entries)).toBe(true);

      const created = await weight.create({
        entryDate: "2018-03-05",
        weightKg: 82.4,
      });
      expect(created).toMatchObject({
        entryDate: "2018-03-05",
        weightKg: 82.4,
      });
      expect(await weight.getByDate("2018-03-05")).toMatchObject({
        id: created.id,
      });
      expect(
        (await weight.getOverview()).entries.some(
          (entry) => entry.id === created.id,
        ),
      ).toBe(true);

      // A refused write is the user's to correct, so each refusal arrives as
      // its own named code rather than as an opaque persistence failure.
      await expect(
        weight.create({ entryDate: "2018-03-05", weightKg: 80 }),
      ).rejects.toMatchObject({ code: "duplicate_date" });
      await expect(
        weight.create({ entryDate: futureDate(), weightKg: 80 }),
      ).rejects.toMatchObject({ code: "future_date" });

      const moved = await weight.update({
        id: created.id,
        entryDate: "2018-03-07",
        weightKg: 81.25,
      });
      expect(moved).toMatchObject({
        id: created.id,
        entryDate: "2018-03-07",
        weightKg: 81.25,
      });
      expect(await weight.getByDate("2018-03-05")).toBeNull();

      const unknownId = "38000000-0000-4000-8000-00000000dead";
      await expect(
        weight.update({
          id: unknownId,
          entryDate: "2018-03-09",
          weightKg: 80,
        }),
      ).rejects.toMatchObject({ code: "not_found" });
      await expect(weight.remove(unknownId)).rejects.toBeInstanceOf(
        WeightRepositoryError,
      );

      await weight.remove(created.id);
      expect(await weight.getByDate("2018-03-07")).toBeNull();
    } finally {
      await client
        .from("weight_entries")
        .delete()
        .gte("entry_date", fixtureFrom)
        .lte("entry_date", fixtureTo);
    }
  });
});

/** Comfortably beyond any configured time zone's today. */
function futureDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 400);
  return date.toISOString().slice(0, 10);
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`${name} is required for repository integration tests.`);
  return value;
}
