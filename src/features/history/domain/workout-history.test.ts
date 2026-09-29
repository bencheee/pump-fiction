import { describe, expect, it } from "vitest";
import type { HistoryWorkoutSummary } from "./workout-history";
import { workoutVolumeTrends } from "./workout-history";

const base: HistoryWorkoutSummary = {
  id: "old",
  workoutDate: "2026-09-20",
  name: "Push",
  programName: "Strength",
  sourceKind: "proposed_split",
  status: "completed",
  activeDurationSeconds: 3600,
  performedExerciseCount: 1,
  volumeKgReps: 1000,
};

describe("workout volume trend", () => {
  it("compares with the preceding workout of the same name, even on the same date", () => {
    const trends = workoutVolumeTrends([
      {
        month: "2026-09",
        workouts: [{ ...base, id: "new", volumeKgReps: 1200 }, base],
      },
    ]);
    expect(trends.get("new")).toEqual({ percent: 20, rising: true });
    expect(trends.has("old")).toBe(false);
  });

  it("never displays NaN for a missing or invalid volume", () => {
    const trends = workoutVolumeTrends([
      {
        month: "2026-09",
        workouts: [{ ...base, id: "new", volumeKgReps: undefined! }, base],
      },
    ]);
    expect(trends.has("new")).toBe(false);
  });
});
