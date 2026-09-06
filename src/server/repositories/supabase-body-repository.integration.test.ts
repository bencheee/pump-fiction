import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { BodyRepositoryError } from "@/features/history/application/body-repository";
import type { Database } from "@/server/database/database.types";
import { SupabaseBodyRepository } from "./supabase-body-repository";

describe("SupabaseBodyRepository", () => {
  it("stores, reads, corrects, and removes measurement types and their entries", async () => {
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
    const body = new SupabaseBodyRepository(client);
    // Suffixed so the fixtures cannot collide with a real measurement, and the
    // suite removes both types again.
    const suffix = randomUUID().slice(0, 8);
    const waistName = `T-041 Waist ${suffix}`;
    const armName = `T-041 Arm ${suffix}`;
    let waistId: string | null = null;
    let armId: string | null = null;

    try {
      const waist = await body.createType({ name: waistName });
      waistId = waist.id;
      expect(waist).toMatchObject({ name: waistName, unit: "cm" });
      const arm = await body.createType({ name: armName });
      armId = arm.id;

      // A refused write is the user's to correct, so each refusal arrives as
      // its own named code rather than as an opaque persistence failure.
      await expect(
        body.createType({ name: waistName.toUpperCase() }),
      ).rejects.toMatchObject({ code: "duplicate_name" });

      const renamed = await body.renameType({
        id: waist.id,
        name: `${waistName} at navel`,
      });
      expect(renamed).toMatchObject({
        id: waist.id,
        name: `${waistName} at navel`,
      });

      const first = await body.createEntry({
        measurementTypeId: waist.id,
        entryDate: "2018-04-05",
        valueCm: 84.2,
      });
      expect(first).toMatchObject({ entryDate: "2018-04-05", valueCm: 84.2 });
      await body.createEntry({
        measurementTypeId: arm.id,
        entryDate: "2018-04-05",
        valueCm: 36.5,
      });

      await expect(
        body.createEntry({
          measurementTypeId: waist.id,
          entryDate: "2018-04-05",
          valueCm: 83,
        }),
      ).rejects.toMatchObject({ code: "duplicate_date" });
      await expect(
        body.createEntry({
          measurementTypeId: waist.id,
          entryDate: futureDate(),
          valueCm: 83,
        }),
      ).rejects.toMatchObject({ code: "future_date" });

      // The entries are the only record of that measurement.
      await expect(body.removeType(waist.id)).rejects.toMatchObject({
        code: "type_has_entries",
      });

      const listed = (await body.list()).types.find(
        (type) => type.id === waist.id,
      );
      expect(listed?.entries).toHaveLength(1);
      expect(await body.getEntry(waist.id, "2018-04-05")).toMatchObject({
        id: first.id,
      });
      expect(await body.getEntry(waist.id, "2018-04-06")).toBeNull();

      const moved = await body.updateEntry({
        id: first.id,
        entryDate: "2018-04-07",
        valueCm: 83.75,
      });
      expect(moved).toMatchObject({
        id: first.id,
        entryDate: "2018-04-07",
        valueCm: 83.75,
      });

      const unknownId = "41000000-0000-4000-8000-00000000dead";
      await expect(
        body.updateEntry({
          id: unknownId,
          entryDate: "2018-04-08",
          valueCm: 83,
        }),
      ).rejects.toMatchObject({ code: "entry_not_found" });
      await expect(body.removeEntry(unknownId)).rejects.toBeInstanceOf(
        BodyRepositoryError,
      );

      await body.removeEntry(first.id);
      expect(await body.getEntry(waist.id, "2018-04-07")).toBeNull();
      // Emptied of measurements, the type may go.
      await body.removeType(waist.id);
      waistId = null;
      expect(
        (await body.list()).types.some((type) => type.id === waist.id),
      ).toBe(false);
    } finally {
      for (const id of [waistId, armId]) {
        if (!id) continue;
        await client
          .from("measurement_entries")
          .delete()
          .eq("measurement_type_id", id);
        await client.from("measurement_types").delete().eq("id", id);
      }
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
