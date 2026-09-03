import { describe, expect, it, vi } from "vitest";
import type { CurrentWorkout } from "../domain/workout";
import {
  WorkoutRepositoryError,
  type WorkoutRepository,
} from "./workout-repository";
import { startWorkout } from "./workout-operations";

const current: CurrentWorkout = {
  id: "10000000-0000-4000-8000-000000000001",
  status: "active",
  sourceKind: "one_time",
  sourceProgramId: null,
  sourceSplitId: null,
  name: "Hotel",
  workoutDate: "2026-09-03",
  startedAt: "2026-09-03T10:00:00.000Z",
  accumulatedActiveSeconds: 0,
  activeSegmentStartedAt: "2026-09-03T10:00:00.000Z",
  revision: 0,
  exercises: [],
};

describe("workout operations", () => {
  it("normalizes and forwards a valid one-time workout", async () => {
    const repository = createRepository();
    const result = await startWorkout(repository, {
      sourceKind: "one_time",
      name: "  Hotel  ",
      exerciseIds: ["20000000-0000-4000-8000-000000000001"],
      startedAt: "2026-09-03T10:00:00.000Z",
    });
    expect(result).toEqual({ ok: true, value: current });
    expect(repository.start).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Hotel" }),
    );
  });

  it("rejects duplicate exercise identity before persistence", async () => {
    const repository = createRepository();
    const result = await startWorkout(repository, {
      sourceKind: "one_time",
      name: "Hotel",
      exerciseIds: [
        "20000000-0000-4000-8000-000000000001",
        "20000000-0000-4000-8000-000000000001",
      ],
      startedAt: "2026-09-03T10:00:00.000Z",
    });
    expect(result).toMatchObject({ ok: false, error: { code: "validation" } });
    expect(repository.start).not.toHaveBeenCalled();
  });

  it("maps the singleton conflict to a stable application failure", async () => {
    const repository = createRepository();
    vi.mocked(repository.start).mockRejectedValue(
      new WorkoutRepositoryError("conflict"),
    );
    const result = await startWorkout(repository, {
      sourceKind: "proposed_split",
      splitId: "30000000-0000-4000-8000-000000000001",
      startedAt: "2026-09-03T10:00:00.000Z",
    });
    expect(result).toEqual({
      ok: false,
      error: {
        code: "conflict",
        message:
          "A current workout already exists. Return to it before starting another.",
        retryable: false,
      },
    });
  });
});

function createRepository(): WorkoutRepository {
  return {
    getToday: vi.fn(),
    getCurrent: vi.fn(),
    start: vi.fn().mockResolvedValue(current),
  };
}
