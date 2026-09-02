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

      await programs.activateProgram(first.id, push.id);
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
      await programs.archiveSplit(pull.id);
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

      await exercises.setStatus(press.id, "archived");
      const retained = await programs.updateSplit(push.id, {
        name: "Push retained",
        exercises: [prescription(press.id, 5, 5, 8)],
      });
      expect(retained.exercises[0]).toMatchObject({
        exerciseId: press.id,
        exerciseStatus: "archived",
        plannedSets: 5,
      });
      await expect(
        programs.updateSplit(mixed.id, {
          name: "Mixed",
          exercises: [prescription(press.id, 3, 8, 8)],
        }),
      ).rejects.toMatchObject({ code: "inactive_exercise" });

      const second = await programs.createProgram({ name: `Plan B ${suffix}` });
      createdProgramIds.push(second.id);
      const only = await programs.createSplit(second.id, {
        name: "Only",
        exercises: [prescription(row.id, 3, 8, 12)],
      });
      await programs.activateProgram(second.id, only.id);
      expect((await programs.getProgram(first.id))?.status).toBe("archived");
      await programs.activateProgram(first.id, push.id);
      expect((await programs.getProgram(second.id))?.status).toBe("archived");

      await expect(programs.archiveSplit(only.id)).rejects.toMatchObject({
        code: "last_active_split",
      });
    } finally {
      await client
        .from("programs")
        .update({ status: "archived", next_split_id: null })
        .in("id", createdProgramIds);
      await client.from("splits").delete().in("program_id", createdProgramIds);
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
