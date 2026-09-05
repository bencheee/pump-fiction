import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/server/database/database.types";
import { SupabaseActiveWorkoutCommandRepository } from "./supabase-active-workout-command-repository";
import { SupabaseExerciseRepository } from "./supabase-exercise-repository";
import { SupabaseProgramRepository } from "./supabase-program-repository";
import { SupabaseWorkoutHistoryRepository } from "./supabase-workout-history-repository";
import { SupabaseWorkoutRepository } from "./supabase-workout-repository";

describe("SupabaseWorkoutHistoryRepository", () => {
  it("reads, corrects, and deletes a saved workout without touching templates", async () => {
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
    const exercises = new SupabaseExerciseRepository(client);
    const programs = new SupabaseProgramRepository(client);
    const workouts = new SupabaseWorkoutRepository(client);
    const commands = new SupabaseActiveWorkoutCommandRepository(client);
    const history = new SupabaseWorkoutHistoryRepository(client);
    const suffix = randomUUID();
    let programId: string | null = null;
    let exerciseId: string | null = null;
    const workoutIds: string[] = [];
    // The seeded baseline points at its own program; a verification run must
    // not leave the local application without a current program.
    const seededCurrentProgramId = (
      await client
        .from("app_settings")
        .select("current_program_id")
        .eq("id", 1)
        .maybeSingle()
    ).data?.current_program_id;

    try {
      const exercise = await exercises.create({
        name: `T-031 Press ${suffix}`,
        baseType: "weights",
        allowedLoadModes: ["weight"],
        persistentNote: "Brace hard",
      });
      exerciseId = exercise.id;
      const program = await programs.createProgram({
        name: `T-031 Plan ${suffix}`,
      });
      programId = program.id;
      const push = await programs.createSplit(program.id, {
        name: "Push",
        exercises: [
          { exerciseId: exercise.id, plannedSets: 2, minReps: 8, maxReps: 12 },
        ],
      });
      const next = await programs.createSplit(program.id, {
        name: "Next",
        exercises: [
          { exerciseId: exercise.id, plannedSets: 1, minReps: 5, maxReps: 8 },
        ],
      });
      await programs.setCurrentProgram(program.id, push.id);

      const startedAt = new Date();
      const current = await workouts.start({
        sourceKind: "proposed_split",
        splitId: push.id,
        startedAt: startedAt.toISOString(),
      });
      workoutIds.push(current.id);
      const firstSetId = current.exercises[0]?.sets[0]?.id;
      const occurrenceId = current.exercises[0]?.id;
      if (!firstSetId || !occurrenceId)
        throw new Error("Expected snapshotted starter rows");

      expect(
        (
          await commands.apply({
            commandId: randomUUID(),
            workoutId: current.id,
            expectedRevision: 0,
            operation: "update_set",
            payload: {
              workoutSetId: firstSetId,
              loadMode: "weight",
              loadKg: 60,
              bandDirection: null,
              bandStrength: null,
              reps: 8,
            },
            clientCreatedAt: new Date().toISOString(),
          })
        ).kind,
      ).toBe("applied");
      expect(
        (
          await commands.apply({
            commandId: randomUUID(),
            workoutId: current.id,
            expectedRevision: 1,
            operation: "finish_workout",
            payload: {
              outcome: "completed",
              finishedAt: new Date(startedAt.getTime() + 600_000).toISOString(),
            },
            clientCreatedAt: new Date().toISOString(),
          })
        ).kind,
      ).toBe("applied");

      // The saved workout is readable through History, with one performed
      // exercise even though only one of its two planned sets was recorded.
      const groups = await history.list();
      const summary = groups
        .flatMap((group) => group.workouts)
        .find((entry) => entry.id === current.id);
      expect(summary).toMatchObject({
        status: "completed",
        performedExerciseCount: 1,
      });

      const detail = await history.getById(current.id);
      expect(detail).not.toBeNull();
      expect(detail?.exercises[0]?.exerciseIdentityId).toBe(exercise.id);
      expect(detail?.exercises[0]?.sets).toHaveLength(2);
      const recordedDuration = detail?.activeDurationSeconds ?? 0;

      await history.correct({
        kind: "timing",
        workoutId: current.id,
        workoutDate: "2026-08-09",
        startedAt: "2026-08-09T09:00:00.000Z",
        finishedAt: "2026-08-09T10:00:00.000Z",
      });
      await history.correct({
        kind: "update_set",
        workoutSetId: detail?.exercises[0]?.sets[1]?.id ?? "",
        loadMode: "weight",
        loadKg: 65,
        bandDirection: null,
        bandStrength: null,
        reps: 6,
      });
      await history.correct({
        kind: "exercise_note",
        workoutExerciseId: occurrenceId,
        note: "Corrected afterwards",
      });

      const corrected = await history.getById(current.id);
      expect(corrected?.workoutDate).toBe("2026-08-09");
      // The measured duration is deliberately not recomputed from the edited
      // timestamps.
      expect(corrected?.activeDurationSeconds).toBe(recordedDuration);
      expect(corrected?.exercises[0]?.workoutNote).toBe("Corrected afterwards");
      expect(corrected?.exercises[0]?.sets[1]).toMatchObject({
        loadKg: 65,
        reps: 6,
      });

      // The correction changed no template and did not move the pointer the
      // original completion advanced.
      const afterCorrection = await programs.getProgram(program.id);
      expect(afterCorrection?.nextSplitId).toBe(next.id);
      expect(await programs.getSplit(push.id)).toMatchObject({
        exercises: [expect.objectContaining({ plannedSets: 2 })],
      });

      await history.correct({ kind: "delete", workoutId: current.id });
      expect(await history.getById(current.id)).toBeNull();
      expect((await programs.getProgram(program.id))?.nextSplitId).toBe(
        next.id,
      );
    } finally {
      if (workoutIds.length > 0) {
        await client
          .from("active_workout_commands")
          .delete()
          .in("workout_id", workoutIds);
        await client.from("workouts").delete().in("id", workoutIds);
      }
      if (programId) {
        await client
          .from("app_settings")
          .update({ current_program_id: null })
          .eq("id", 1);
        await client.from("programs").delete().eq("id", programId);
      }
      if (exerciseId)
        await client.from("exercises").delete().eq("id", exerciseId);
      if (seededCurrentProgramId) {
        await client
          .from("app_settings")
          .update({ current_program_id: seededCurrentProgramId })
          .eq("id", 1);
      }
    }
  });
});

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`${name} is required for repository integration tests.`);
  return value;
}
