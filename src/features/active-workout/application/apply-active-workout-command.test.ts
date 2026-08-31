import { describe, expect, it, vi } from "vitest";

import type { ActiveWorkoutCommandRepository } from "./active-workout-command-repository";
import { applyActiveWorkoutCommand } from "./apply-active-workout-command";

const command = {
  commandId: "10000000-0000-4000-8000-000000000001",
  workoutId: "10000000-0000-4000-8000-000000000002",
  expectedRevision: 4,
  operation: "set_workout_exercise_note" as const,
  payload: {
    workoutExerciseId: "10000000-0000-4000-8000-000000000003",
    note: "Keep the shoulder down.",
  },
  clientCreatedAt: "2026-08-31T14:00:00.000Z",
};

describe("applyActiveWorkoutCommand", () => {
  it("rejects an invalid envelope before persistence", async () => {
    const repository = createRepository();

    const result = await applyActiveWorkoutCommand(repository, {
      ...command,
      expectedRevision: -1,
    });

    expect(result).toMatchObject({
      kind: "rejected",
      code: "validation",
      fieldErrors: {
        expectedRevision: ["Provide a non-negative workout revision."],
      },
    });
    expect(repository.apply).not.toHaveBeenCalled();
  });

  it("returns an explicit acknowledgement for an idempotent duplicate", async () => {
    const repository = createRepository();
    vi.mocked(repository.apply).mockResolvedValue({
      kind: "duplicate",
      commandId: command.commandId,
      workoutId: command.workoutId,
      expectedRevision: 4,
      resultingRevision: 5,
    });

    const result = await applyActiveWorkoutCommand(repository, command);

    expect(result).toEqual({
      kind: "acknowledged",
      acknowledgement: {
        commandId: command.commandId,
        workoutId: command.workoutId,
        expectedRevision: 4,
        resultingRevision: 5,
        duplicate: true,
      },
    });
  });

  it("returns the recoverable refresh-and-replay conflict contract", async () => {
    const repository = createRepository();
    vi.mocked(repository.apply).mockResolvedValue({
      kind: "conflict",
      commandId: command.commandId,
      workoutId: command.workoutId,
      expectedRevision: 4,
      actualRevision: 7,
    });

    const result = await applyActiveWorkoutCommand(repository, command);

    expect(result).toEqual({
      kind: "conflict",
      conflict: {
        commandId: command.commandId,
        workoutId: command.workoutId,
        expectedRevision: 4,
        actualRevision: 7,
        recovery: "refresh_and_replay",
      },
    });
  });
});

function createRepository(): ActiveWorkoutCommandRepository {
  return {
    apply: vi.fn().mockResolvedValue({
      kind: "applied",
      commandId: command.commandId,
      workoutId: command.workoutId,
      expectedRevision: 4,
      resultingRevision: 5,
    }),
  };
}
