import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/server/database/database.types";
import { SupabaseActiveWorkoutCommandRepository } from "./supabase-active-workout-command-repository";
import { SupabaseExerciseRepository } from "./supabase-exercise-repository";
import { SupabaseExerciseStatisticsRepository } from "./supabase-exercise-statistics-repository";
import { SupabaseProgramRepository } from "./supabase-program-repository";
import { SupabaseWorkoutRepository } from "./supabase-workout-repository";

describe("SupabaseExerciseStatisticsRepository", () => {
  it("groups performances by persistent identity and survives deletion", async () => {
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
    const statistics = new SupabaseExerciseStatisticsRepository(client);
    const suffix = randomUUID();
    let programId: string | null = null;
    let exerciseId: string | null = null;
    const workoutIds: string[] = [];
    const seededCurrentProgramId = (
      await client
        .from("app_settings")
        .select("current_program_id")
        .eq("id", 1)
        .maybeSingle()
    ).data?.current_program_id;

    try {
      const exercise = await exercises.create({
        name: `T-033 Press ${suffix}`,
        baseType: "weights",
        allowedLoadModes: ["weight"],
        persistentNote: "Brace hard",
      });
      exerciseId = exercise.id;
      const program = await programs.createProgram({
        name: `T-033 Plan ${suffix}`,
      });
      programId = program.id;
      const first = await programs.createSplit(program.id, {
        name: "A",
        exercises: [
          { exerciseId: exercise.id, plannedSets: 2, minReps: 8, maxReps: 12 },
        ],
      });
      await programs.createSplit(program.id, {
        name: "B",
        exercises: [
          { exerciseId: exercise.id, plannedSets: 1, minReps: 6, maxReps: 10 },
        ],
      });
      await programs.setCurrentProgram(program.id, first.id);

      const startedAt = new Date();
      const current = await workouts.start({
        sourceKind: "proposed_split",
        splitId: first.id,
        startedAt: startedAt.toISOString(),
      });
      workoutIds.push(current.id);
      const setId = current.exercises[0]?.sets[0]?.id;
      if (!setId) throw new Error("Expected a snapshotted starter set");

      await commands.apply({
        commandId: randomUUID(),
        workoutId: current.id,
        expectedRevision: 0,
        operation: "update_set",
        payload: {
          workoutSetId: setId,
          loadMode: "weight",
          loadKg: 60,
          bandDirection: null,
          bandStrength: null,
          reps: 8,
        },
        clientCreatedAt: new Date().toISOString(),
      });
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
      });

      const listed = (await statistics.list()).find(
        (entry) => entry.exerciseIdentityId === exercise.id,
      );
      expect(listed).toMatchObject({
        exerciseName: `T-033 Press ${suffix}`,
        stillInLibrary: true,
      });
      expect(listed?.latestPerformance?.workoutId).toBe(current.id);

      const loaded = await statistics.getPerformances(exercise.id);
      expect(loaded?.performances).toHaveLength(1);
      expect(loaded?.performances[0]?.sets[0]).toMatchObject({
        loadMode: "weight",
        loadKg: 60,
        reps: 8,
      });
      // The unrecorded second set is still part of the stored performance.
      expect(loaded?.performances[0]?.sets).toHaveLength(2);

      // Deleting the definition keeps the history under its identity.
      await exercises.delete(exercise.id);
      exerciseId = null;
      const afterDeletion = await statistics.getPerformances(exercise.id);
      expect(afterDeletion).toMatchObject({
        stillInLibrary: false,
        exerciseName: `T-033 Press ${suffix}`,
      });
      expect(afterDeletion?.performances).toHaveLength(1);
      expect(await statistics.getPerformances(randomUUID())).toBeNull();
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
