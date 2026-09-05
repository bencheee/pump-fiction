import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/server/database/database.types";
import { SupabaseActiveWorkoutCommandRepository } from "./supabase-active-workout-command-repository";
import { SupabaseExerciseRepository } from "./supabase-exercise-repository";
import { SupabaseProgramRepository } from "./supabase-program-repository";
import { SupabaseWorkoutRepository } from "./supabase-workout-repository";

describe("SupabaseWorkoutRepository", () => {
  it("persists proposed and one-time starter rows and the workout lifecycle", async () => {
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
        name: `T-014 Press ${suffix}`,
        baseType: "weights",
        allowedLoadModes: ["weight"],
        persistentNote: "Brace hard",
      });
      exerciseId = exercise.id;
      const program = await programs.createProgram({
        name: `T-014 Plan ${suffix}`,
      });
      programId = program.id;
      const push = await programs.createSplit(program.id, {
        name: "Push",
        exercises: [
          { exerciseId: exercise.id, plannedSets: 3, minReps: 8, maxReps: 12 },
        ],
      });
      const next = await programs.createSplit(program.id, {
        name: "Next",
        exercises: [
          { exerciseId: exercise.id, plannedSets: 2, minReps: 5, maxReps: 8 },
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
      expect(current.exercises).toHaveLength(1);
      expect(current.exercises[0]?.sets).toHaveLength(3);
      expect((await workouts.getToday()).currentWorkout?.id).toBe(current.id);

      const workoutSetId = current.exercises[0]?.sets[0]?.id;
      if (!workoutSetId) throw new Error("Expected initial workout set");
      const updateId = randomUUID();
      const update = {
        commandId: updateId,
        workoutId: current.id,
        expectedRevision: 0,
        operation: "update_set" as const,
        payload: {
          workoutSetId,
          loadMode: "weight" as const,
          loadKg: 52.5,
          bandDirection: null,
          bandStrength: null,
          reps: 8,
        },
        clientCreatedAt: new Date(startedAt.getTime() + 1_000).toISOString(),
      };
      expect((await commands.apply(update)).kind).toBe("applied");
      expect((await commands.apply(update)).kind).toBe("duplicate");

      expect(
        (
          await commands.apply({
            commandId: randomUUID(),
            workoutId: current.id,
            expectedRevision: 1,
            operation: "pause_timer",
            payload: {
              transitionedAt: new Date(
                startedAt.getTime() + 60_000,
              ).toISOString(),
            },
            clientCreatedAt: new Date(
              startedAt.getTime() + 60_000,
            ).toISOString(),
          })
        ).kind,
      ).toBe("applied");
      expect((await workouts.getCurrent())?.status).toBe("paused");
      expect(
        (
          await commands.apply({
            commandId: randomUUID(),
            workoutId: current.id,
            expectedRevision: 2,
            operation: "resume_timer",
            payload: {
              transitionedAt: new Date(
                startedAt.getTime() + 120_000,
              ).toISOString(),
            },
            clientCreatedAt: new Date(
              startedAt.getTime() + 120_000,
            ).toISOString(),
          })
        ).kind,
      ).toBe("applied");
      expect(
        (
          await commands.apply({
            commandId: randomUUID(),
            workoutId: current.id,
            expectedRevision: 3,
            operation: "finish_workout",
            payload: {
              outcome: "completed",
              finishedAt: new Date(startedAt.getTime() + 180_000).toISOString(),
            },
            clientCreatedAt: new Date(
              startedAt.getTime() + 180_000,
            ).toISOString(),
          })
        ).kind,
      ).toBe("applied");
      expect(await workouts.getCurrent()).toBeNull();
      expect((await programs.getProgram(program.id))?.nextSplitId).toBe(
        next.id,
      );

      const oneTime = await workouts.start({
        sourceKind: "one_time",
        name: "Hotel",
        exerciseIds: [exercise.id],
        startedAt: new Date(startedAt.getTime() + 240_000).toISOString(),
      });
      workoutIds.push(oneTime.id);
      expect(oneTime.exercises[0]?.plannedSets).toBeNull();
      expect(oneTime.exercises[0]?.sets).toEqual([
        expect.objectContaining({
          position: 1,
          loadMode: null,
          reps: null,
        }),
      ]);
      expect(
        (
          await commands.apply({
            commandId: randomUUID(),
            workoutId: oneTime.id,
            expectedRevision: 0,
            operation: "finish_workout",
            payload: {
              outcome: "discarded",
              finishedAt: new Date(startedAt.getTime() + 300_000).toISOString(),
            },
            clientCreatedAt: new Date(
              startedAt.getTime() + 300_000,
            ).toISOString(),
          })
        ).kind,
      ).toBe("applied");
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
