import { describe, expect, it, vi } from "vitest";
import type {
  HistoryMonthGroup,
  HistoryWorkout,
} from "../domain/workout-history";
import {
  correctHistoryWorkout,
  getHistoryWorkout,
  listWorkoutHistory,
} from "./workout-history-operations";
import {
  WorkoutHistoryRepositoryError,
  type WorkoutHistoryRepository,
} from "./workout-history-repository";

const workoutId = "31000000-0000-4000-8000-000000000001";
const workoutExerciseId = "31000000-0000-4000-8000-000000000002";
const workoutSetId = "31000000-0000-4000-8000-000000000003";
const exerciseId = "31000000-0000-4000-8000-000000000004";

const workout: HistoryWorkout = {
  id: workoutId,
  status: "completed",
  sourceKind: "proposed_split",
  sourceProgramId: null,
  sourceSplitId: null,
  sourceProgramIdentityId: "31000000-0000-4000-8000-000000000010",
  sourceSplitIdentityId: "31000000-0000-4000-8000-000000000011",
  programName: "Plan",
  splitName: "Push",
  name: "Push",
  workoutDate: "2026-09-04",
  startedAt: "2026-09-04T10:00:00.000Z",
  finishedAt: "2026-09-04T11:00:00.000Z",
  activeDurationSeconds: 3000,
  exercises: [],
};

const months: readonly HistoryMonthGroup[] = [
  {
    month: "2026-09",
    workouts: [
      {
        id: workoutId,
        workoutDate: "2026-09-04",
        name: "Push",
        programName: "Plan",
        sourceKind: "proposed_split",
        status: "completed",
        activeDurationSeconds: 3000,
        performedExerciseCount: 2,
      },
    ],
  },
];

describe("workout history operations", () => {
  it("returns the month groups the repository provides", async () => {
    const repository = createRepository();
    await expect(listWorkoutHistory(repository)).resolves.toEqual({
      ok: true,
      value: months,
    });
  });

  it("reports a load failure as retryable persistence", async () => {
    const repository = createRepository();
    repository.list.mockRejectedValueOnce(
      new WorkoutHistoryRepositoryError("unavailable"),
    );
    const result = await listWorkoutHistory(repository);
    expect(result).toMatchObject({
      ok: false,
      error: { code: "persistence", retryable: true },
    });
  });

  it("reports an unknown or current workout as not found", async () => {
    const repository = createRepository();
    repository.getById.mockResolvedValueOnce(null);
    const result = await getHistoryWorkout(repository, workoutId);
    expect(result).toMatchObject({
      ok: false,
      error: { code: "not_found", retryable: false },
    });
  });

  it("applies a timing correction and returns the reloaded workout", async () => {
    const repository = createRepository();
    const result = await correctHistoryWorkout(repository, {
      kind: "timing",
      workoutId,
      workoutDate: "2026-09-04",
      startedAt: "2026-09-04T10:00:00.000Z",
      finishedAt: "2026-09-04T11:00:00.000Z",
    });
    expect(result).toEqual({ ok: true, value: workout });
    expect(repository.correct).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "timing", workoutId }),
    );
    expect(repository.getById).toHaveBeenCalledWith(workoutId);
  });

  it("rejects a finish time that precedes the start before persistence", async () => {
    const repository = createRepository();
    const result = await correctHistoryWorkout(repository, {
      kind: "timing",
      workoutId,
      workoutDate: "2026-09-04",
      startedAt: "2026-09-04T11:00:00.000Z",
      finishedAt: "2026-09-04T10:00:00.000Z",
    });
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "validation",
        fieldErrors: { finishedAt: expect.any(Array) },
      },
    });
    expect(repository.correct).not.toHaveBeenCalled();
  });

  it("rejects an impossible calendar date before persistence", async () => {
    const repository = createRepository();
    const result = await correctHistoryWorkout(repository, {
      kind: "timing",
      workoutId,
      workoutDate: "2026-02-30",
      startedAt: "2026-09-04T10:00:00.000Z",
      finishedAt: "2026-09-04T11:00:00.000Z",
    });
    expect(result).toMatchObject({
      ok: false,
      error: { fieldErrors: { workoutDate: expect.any(Array) } },
    });
    expect(repository.correct).not.toHaveBeenCalled();
  });

  it("rejects a set value that is not a positive number", async () => {
    const repository = createRepository();
    const result = await correctHistoryWorkout(repository, {
      kind: "update_set",
      workoutSetId,
      loadMode: "weight",
      loadKg: 0,
      bandDirection: null,
      bandStrength: null,
      reps: 8,
    });
    expect(result).toMatchObject({
      ok: false,
      error: { fieldErrors: { loadKg: expect.any(Array) } },
    });
    expect(repository.correct).not.toHaveBeenCalled();
  });

  it("keeps a cleared set value as an explicit null", async () => {
    const repository = createRepository();
    const result = await correctHistoryWorkout(repository, {
      kind: "update_set",
      workoutSetId,
      loadMode: "weight",
      loadKg: null,
      bandDirection: null,
      bandStrength: null,
      reps: null,
    });
    expect(result.ok).toBe(true);
    expect(repository.correct).toHaveBeenCalledWith(
      expect.objectContaining({ loadKg: null, reps: null }),
    );
  });

  it("rejects a reorder that repeats an occurrence", async () => {
    const repository = createRepository();
    const result = await correctHistoryWorkout(repository, {
      kind: "reorder_exercises",
      workoutId,
      workoutExerciseIds: [workoutExerciseId, workoutExerciseId],
    });
    expect(result).toMatchObject({
      ok: false,
      error: { fieldErrors: { workoutExerciseIds: expect.any(Array) } },
    });
    expect(repository.correct).not.toHaveBeenCalled();
  });

  it("returns no workout after a deletion instead of reloading it", async () => {
    const repository = createRepository();
    const result = await correctHistoryWorkout(repository, {
      kind: "delete",
      workoutId,
    });
    expect(result).toEqual({ ok: true, value: null });
    expect(repository.getById).not.toHaveBeenCalled();
  });

  it("asks for confirmation before removing recorded data", async () => {
    const repository = createRepository();
    repository.correct.mockRejectedValueOnce(
      new WorkoutHistoryRepositoryError("confirmation_required"),
    );
    const result = await correctHistoryWorkout(repository, {
      kind: "remove_set",
      workoutSetId,
      confirmedPopulatedRemoval: false,
    });
    expect(result).toMatchObject({
      ok: false,
      error: { code: "validation", retryable: false },
    });
  });

  it("reports an exercise that left the library as not found", async () => {
    const repository = createRepository();
    repository.correct.mockRejectedValueOnce(
      new WorkoutHistoryRepositoryError("unavailable_exercise"),
    );
    const result = await correctHistoryWorkout(repository, {
      kind: "add_exercise",
      workoutId,
      exerciseId,
    });
    expect(result).toMatchObject({
      ok: false,
      error: { code: "not_found", retryable: false },
    });
  });

  it("rejects an unsupported correction", async () => {
    const repository = createRepository();
    const result = await correctHistoryWorkout(repository, {
      kind: "rewind_rotation",
      workoutId,
    });
    expect(result).toMatchObject({
      ok: false,
      error: { fieldErrors: { kind: expect.any(Array) } },
    });
    expect(repository.correct).not.toHaveBeenCalled();
  });
});

function createRepository() {
  return {
    list: vi.fn<WorkoutHistoryRepository["list"]>().mockResolvedValue(months),
    getById: vi
      .fn<WorkoutHistoryRepository["getById"]>()
      .mockResolvedValue(workout),
    correct: vi
      .fn<WorkoutHistoryRepository["correct"]>()
      .mockResolvedValue(undefined),
  };
}
