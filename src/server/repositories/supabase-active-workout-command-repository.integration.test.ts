import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { ActiveWorkoutCommand } from "@/features/active-workout/domain/active-workout-command";
import type { Database } from "@/server/database/database.types";

import { SupabaseActiveWorkoutCommandRepository } from "./supabase-active-workout-command-repository";

describe("SupabaseActiveWorkoutCommandRepository", () => {
  it("applies commands transactionally, deduplicates retries, and rejects stale revisions", async () => {
    const url = requireEnvironment("SUPABASE_URL");
    const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
    const client = createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const repository = new SupabaseActiveWorkoutCommandRepository(client);
    const exerciseId = randomUUID();
    const workoutId = randomUUID();
    const workoutExerciseId = randomUUID();
    const startedAt = new Date("2026-08-31T12:00:00.000Z");

    try {
      await requireSuccess(
        client.from("exercises").insert({
          id: exerciseId,
          name: `T-008 exercise ${exerciseId}`,
          base_type: "weights",
        }),
      );
      await requireSuccess(
        client.from("workouts").insert({
          id: workoutId,
          status: "active",
          source_kind: "one_time",
          one_time_name: "T-008 workout",
          workout_date: "2026-08-31",
          started_at: startedAt.toISOString(),
          active_segment_started_at: startedAt.toISOString(),
        }),
      );
      await requireSuccess(
        client.from("workout_exercises").insert({
          id: workoutExerciseId,
          workout_id: workoutId,
          exercise_id: exerciseId,
          position: 1,
          exercise_name_snapshot: "T-008 exercise",
          exercise_base_type_snapshot: "weights",
          workout_note: "Before",
        }),
      );

      const noteCommand = createNoteCommand(workoutId, workoutExerciseId, 0);
      const [first, duplicate] = await Promise.all([
        repository.apply(noteCommand),
        repository.apply(noteCommand),
      ]);
      const conflict = await repository.apply({
        ...createNoteCommand(workoutId, workoutExerciseId, 0),
        commandId: randomUUID(),
      });
      const pause = await repository.apply(
        createTimerCommand(
          workoutId,
          1,
          "pause_timer",
          new Date(startedAt.getTime() + 60_000),
        ),
      );
      const resume = await repository.apply(
        createTimerCommand(
          workoutId,
          2,
          "resume_timer",
          new Date(startedAt.getTime() + 120_000),
        ),
      );

      expect([first.kind, duplicate.kind].sort()).toEqual([
        "applied",
        "duplicate",
      ]);
      expect(first).toMatchObject({ resultingRevision: 1 });
      expect(duplicate).toMatchObject({ resultingRevision: 1 });
      expect(conflict).toMatchObject({
        kind: "conflict",
        expectedRevision: 0,
        actualRevision: 1,
      });
      expect(pause).toMatchObject({ kind: "applied", resultingRevision: 2 });
      expect(resume).toMatchObject({ kind: "applied", resultingRevision: 3 });

      const workoutExercise = await client
        .from("workout_exercises")
        .select("workout_note")
        .eq("id", workoutExerciseId)
        .single();
      const workout = await client
        .from("workouts")
        .select(
          "revision, status, accumulated_active_seconds, active_segment_started_at",
        )
        .eq("id", workoutId)
        .single();
      const recordedCommands = await client
        .from("active_workout_commands")
        .select("command_id", { count: "exact", head: true })
        .eq("workout_id", workoutId);

      expect(workoutExercise.error).toBeNull();
      expect(workoutExercise.data?.workout_note).toBe("After");
      expect(workout.error).toBeNull();
      expect(workout.data).toMatchObject({
        revision: 3,
        status: "active",
        accumulated_active_seconds: 60,
      });
      expect(Date.parse(workout.data?.active_segment_started_at ?? "")).toBe(
        startedAt.getTime() + 120_000,
      );
      expect(recordedCommands.error).toBeNull();
      expect(recordedCommands.count).toBe(3);
    } finally {
      await client.from("workouts").delete().eq("id", workoutId);
      await client.from("exercises").delete().eq("id", exerciseId);
    }
  });
});

function createNoteCommand(
  workoutId: string,
  workoutExerciseId: string,
  expectedRevision: number,
): ActiveWorkoutCommand {
  return {
    commandId: randomUUID(),
    workoutId,
    expectedRevision,
    operation: "set_workout_exercise_note",
    payload: { workoutExerciseId, note: "After" },
    clientCreatedAt: new Date().toISOString(),
  };
}

function createTimerCommand(
  workoutId: string,
  expectedRevision: number,
  operation: "pause_timer" | "resume_timer",
  transitionedAt: Date,
): ActiveWorkoutCommand {
  return {
    commandId: randomUUID(),
    workoutId,
    expectedRevision,
    operation,
    payload: { transitionedAt: transitionedAt.toISOString() },
    clientCreatedAt: new Date().toISOString(),
  };
}

async function requireSuccess(
  query: PromiseLike<{ error: { message: string } | null }>,
): Promise<void> {
  const result = await query;
  if (result.error) {
    throw new Error(result.error.message);
  }
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for repository integration tests.`);
  }
  return value;
}
