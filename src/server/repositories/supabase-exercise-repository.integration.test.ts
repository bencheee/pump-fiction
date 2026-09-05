import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/server/database/database.types";

import { SupabaseExerciseRepository } from "./supabase-exercise-repository";

describe("SupabaseExerciseRepository", () => {
  it("persists definitions atomically and preserves identity through lifecycle changes", async () => {
    const url = requireEnvironment("SUPABASE_URL");
    const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
    const client = createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const repository = new SupabaseExerciseRepository(client);
    const suffix = randomUUID();
    const originalName = `T-010 Press ${suffix}`;
    const editedName = `T-010 Pull ${suffix}`;
    const programId = randomUUID();
    const splitId = randomUUID();

    const created = await repository.create({
      name: originalName,
      baseType: "weights",
      allowedLoadModes: ["weight", "weight_resistance_band"],
      persistentNote: "Original note",
    });

    try {
      await requireSuccess(
        client.from("programs").insert({ id: programId, name: "T-010" }),
      );
      await requireSuccess(
        client.from("splits").insert({
          id: splitId,
          program_id: programId,
          name: "T-010 split",
          position: 1,
        }),
      );
      await requireSuccess(
        client.from("split_exercises").insert({
          split_id: splitId,
          exercise_id: created.id,
          position: 1,
          planned_sets: 3,
          min_reps: 6,
          max_reps: 10,
        }),
      );

      const used = await repository.getById(created.id);
      const updated = await repository.update(created.id, {
        name: editedName,
        baseType: "bodyweight",
        allowedLoadModes: ["bodyweight", "bodyweight_resistance_band"],
        persistentNote: "Updated note",
      });

      await expect(
        repository.create({
          name: editedName,
          baseType: "bodyweight",
          allowedLoadModes: ["bodyweight"],
          persistentNote: "",
        }),
      ).rejects.toMatchObject({ code: "duplicate_name" });

      expect(used).toMatchObject({
        id: created.id,
        splitUsageCount: 1,
      });
      expect(updated).toEqual({
        id: created.id,
        name: editedName,
        baseType: "bodyweight",
        allowedLoadModes: ["bodyweight", "bodyweight_resistance_band"],
        persistentNote: "Updated note",
        splitUsageCount: 1,
      });

      await repository.delete(created.id);

      expect(await repository.getById(created.id)).toBeNull();
      expect(await repository.list()).not.toContainEqual(
        expect.objectContaining({ id: created.id }),
      );
      const remainingPrescriptions = await client
        .from("split_exercises")
        .select("exercise_id")
        .eq("split_id", splitId);
      expect(remainingPrescriptions.data).toEqual([]);
    } finally {
      await client.from("splits").delete().eq("id", splitId);
      await client.from("programs").delete().eq("id", programId);
    }
  });
});

async function requireSuccess(
  query: PromiseLike<{ error: { message: string } | null }>,
): Promise<void> {
  const result = await query;
  if (result.error) throw new Error(result.error.message);
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for repository integration tests.`);
  }
  return value;
}
