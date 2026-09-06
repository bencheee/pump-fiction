import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/server/database/database.types";
import { SupabaseActiveWorkoutCommandRepository } from "./supabase-active-workout-command-repository";
import { SupabaseExerciseRepository } from "./supabase-exercise-repository";
import { SupabaseProgramRepository } from "./supabase-program-repository";
import { SupabaseSplitStatisticsRepository } from "./supabase-split-statistics-repository";
import { SupabaseWorkoutRepository } from "./supabase-workout-repository";

describe("SupabaseSplitStatisticsRepository", () => {
  it("returns split-sourced workouts with identities, live names, and snapshots", async () => {
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
    const splits = new SupabaseSplitStatisticsRepository(client);
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
        name: `T-035 Press ${suffix}`,
        baseType: "weights",
        allowedLoadModes: ["weight"],
        persistentNote: "",
      });
      exerciseId = exercise.id;
      const program = await programs.createProgram({
        name: `T-035 Plan ${suffix}`,
      });
      programId = program.id;
      const push = await programs.createSplit(program.id, {
        name: "Push",
        exercises: [
          { exerciseId: exercise.id, plannedSets: 1, minReps: 8, maxReps: 12 },
        ],
      });
      await programs.createSplit(program.id, {
        name: "Pull",
        exercises: [
          { exerciseId: exercise.id, plannedSets: 1, minReps: 8, maxReps: 12 },
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
      await commands.apply({
        commandId: randomUUID(),
        workoutId: current.id,
        expectedRevision: 0,
        operation: "finish_workout",
        payload: {
          outcome: "completed",
          finishedAt: new Date(startedAt.getTime() + 1_800_000).toISOString(),
        },
        clientCreatedAt: new Date().toISOString(),
      });

      const row = (await splits.listSplitWorkouts()).find(
        (entry) => entry.workoutId === current.id,
      );
      expect(row).toMatchObject({
        status: "completed",
        sourceKind: "proposed_split",
        splitIdentityId: push.id,
        programIdentityId: program.id,
        splitName: "Push",
        splitNameSnapshot: "Push",
        programName: `T-035 Plan ${suffix}`,
      });
      expect(row?.activeDurationSeconds).toBeGreaterThanOrEqual(1_799);

      // Deleting the split keeps the row under its identity with the snapshot.
      // The program is current, so its other split must remain; Push is not the
      // last one.
      await programs.deleteSplit(push.id);
      const afterDeletion = (await splits.listSplitWorkouts()).find(
        (entry) => entry.workoutId === current.id,
      );
      expect(afterDeletion).toMatchObject({
        splitIdentityId: push.id,
        splitName: null,
        splitNameSnapshot: "Push",
      });
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
