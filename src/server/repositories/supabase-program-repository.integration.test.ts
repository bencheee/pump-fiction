import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/server/database/database.types";

import { SupabaseExerciseRepository } from "./supabase-exercise-repository";
import { SupabaseProgramRepository } from "./supabase-program-repository";

describe("SupabaseProgramRepository", () => {
  it("persists lifecycle, ordering, archival successor, and rotation atomically", async () => {
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
    const programs = new SupabaseProgramRepository(client);
    const exercises = new SupabaseExerciseRepository(client);
    const suffix = randomUUID();
    const createdProgramIds: string[] = [];
    const createdExerciseIds: string[] = [];

    try {
      const press = await exercises.create({
        name: `T-012 Press ${suffix}`,
        baseType: "weights",
        allowedLoadModes: ["weight"],
        persistentNote: "",
      });
      const row = await exercises.create({
        name: `T-012 Row ${suffix}`,
        baseType: "weights",
        allowedLoadModes: ["weight"],
        persistentNote: "",
      });
      createdExerciseIds.push(press.id, row.id);

      const first = await programs.createProgram({ name: `Plan A ${suffix}` });
      createdProgramIds.push(first.id);
      const push = await programs.createSplit(first.id, {
        name: "Push",
        exercises: [prescription(press.id, 3, 8, 12)],
      });
      const pull = await programs.createSplit(first.id, {
        name: "Pull",
        exercises: [prescription(row.id, 4, 6, 10)],
      });
      const mixed = await programs.createSplit(first.id, {
        name: "Mixed",
        exercises: [
          prescription(press.id, 2, 10, 12),
          prescription(row.id, 2, 10, 12),
        ],
      });

      await programs.setCurrentProgram(first.id, push.id);
      const reordered = await programs.reorderSplits(first.id, [
        mixed.id,
        push.id,
        pull.id,
      ]);
      expect(reordered.nextSplitId).toBe(push.id);
      expect(reordered.splits.map((split) => split.id)).toEqual([
        mixed.id,
        push.id,
        pull.id,
      ]);

      await programs.setNextSplit(first.id, pull.id);
      await programs.deleteSplit(pull.id);
      expect((await programs.getProgram(first.id))?.nextSplitId).toBe(mixed.id);

      const advanced = await programs.advanceAfterProposedCompletion(
        first.id,
        mixed.id,
      );
      const duplicateAdvance = await programs.advanceAfterProposedCompletion(
        first.id,
        mixed.id,
      );
      expect(advanced).toBe(push.id);
      expect(duplicateAdvance).toBe(push.id);

      const retained = await programs.updateSplit(push.id, {
        name: "Push retained",
        exercises: [prescription(press.id, 5, 5, 8)],
      });
      expect(retained.exercises[0]).toMatchObject({
        exerciseId: press.id,
        plannedSets: 5,
      });
      await expect(
        programs.updateSplit(push.id, {
          name: "Push retained",
          exercises: [prescription(randomUUID(), 3, 8, 8)],
        }),
      ).rejects.toMatchObject({ code: "unknown_exercise" });

      const second = await programs.createProgram({ name: `Plan B ${suffix}` });
      createdProgramIds.push(second.id);
      const only = await programs.createSplit(second.id, {
        name: "Only",
        exercises: [prescription(row.id, 3, 8, 12)],
      });
      await programs.setCurrentProgram(second.id, only.id);
      expect((await programs.getProgram(first.id))?.isCurrent).toBe(false);
      expect((await programs.getProgram(second.id))?.isCurrent).toBe(true);

      await expect(programs.deleteSplit(only.id)).rejects.toMatchObject({
        code: "last_split",
      });

      await programs.setCurrentProgram(first.id, push.id);
      expect((await programs.getProgram(second.id))?.isCurrent).toBe(false);

      await programs.deleteProgram(second.id);
      expect(await programs.getProgram(second.id)).toBeNull();

      await exercises.delete(press.id);
      const withoutDeleted = await programs.getSplit(push.id);
      expect(withoutDeleted?.exercises).toEqual([]);
    } finally {
      await client
        .from("app_settings")
        .update({ current_program_id: null })
        .eq("id", 1);
      await client.from("programs").delete().in("id", createdProgramIds);
      await client.from("exercises").delete().in("id", createdExerciseIds);
    }
  });
});

function prescription(
  exerciseId: string,
  plannedSets: number,
  minReps: number,
  maxReps: number,
) {
  return { exerciseId, plannedSets, minReps, maxReps };
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for repository integration tests.`);
  }
  return value;
}
