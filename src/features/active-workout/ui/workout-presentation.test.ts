import { describe, expect, it } from "vitest";

import type { WorkoutSet } from "../domain/workout";
import { formatSetSummary, formatWorkoutSetLine } from "./workout-presentation";

const sidePlankSet: WorkoutSet = {
  id: "36000000-0000-4000-8000-000000000001",
  position: 1,
  loadMode: "bodyweight",
  loadKg: null,
  bandDirection: null,
  bandStrength: null,
  reps: 40,
};

describe("timed set presentation", () => {
  it("renders a timed History set in seconds instead of reps", () => {
    expect(formatSetSummary(sidePlankSet, "seconds")).toBe("40 sec");
  });

  it("renders Last time with the snapshotted seconds measurement", () => {
    expect(formatWorkoutSetLine(sidePlankSet, "seconds")).toBe("40 sec");
  });
});
