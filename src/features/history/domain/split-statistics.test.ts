import { describe, expect, it } from "vitest";
import {
  durationSeries,
  programOptions,
  splitSummaries,
  splitWorkouts,
  type SplitWorkout,
} from "./split-statistics";

const planA = "35000000-0000-4000-8000-0000000000a0";
const planB = "35000000-0000-4000-8000-0000000000b0";
const pushA = "35000000-0000-4000-8000-0000000000a1";
const pullA = "35000000-0000-4000-8000-0000000000a2";
const pushB = "35000000-0000-4000-8000-0000000000b1";

let sequence = 0;
function workout(values: Partial<SplitWorkout>): SplitWorkout {
  sequence += 1;
  return {
    workoutId: `35000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    workoutDate: values.workoutDate ?? "2026-08-10",
    status: values.status ?? "completed",
    sourceKind: values.sourceKind ?? "proposed_split",
    activeDurationSeconds: values.activeDurationSeconds ?? 3600,
    splitIdentityId: values.splitIdentityId ?? pushA,
    programIdentityId: values.programIdentityId ?? planA,
    splitName: values.splitName === undefined ? "Push" : values.splitName,
    splitNameSnapshot: values.splitNameSnapshot ?? "Push",
    programName:
      values.programName === undefined ? "Plan A" : values.programName,
    programNameSnapshot: values.programNameSnapshot ?? "Plan A",
  };
}

describe("split summaries", () => {
  it("keeps same-named splits from different programs apart", () => {
    const summaries = splitSummaries([
      workout({ splitIdentityId: pushA, programIdentityId: planA }),
      workout({
        splitIdentityId: pushB,
        programIdentityId: planB,
        programName: "Plan B",
        programNameSnapshot: "Plan B",
        workoutDate: "2026-08-12",
      }),
    ]);
    expect(summaries).toHaveLength(2);
    expect(summaries.map((entry) => entry.programName)).toEqual([
      "Plan B",
      "Plan A",
    ]);
  });

  it("keeps a renamed split as one entry under its live name", () => {
    const summaries = splitSummaries([
      workout({
        splitNameSnapshot: "Push",
        splitName: "Upper",
        workoutDate: "2026-08-01",
      }),
      workout({
        splitNameSnapshot: "Upper",
        splitName: "Upper",
        workoutDate: "2026-08-08",
      }),
    ]);
    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.splitName).toBe("Upper");
    expect(summaries[0]?.completedWorkoutCount).toBe(2);
  });

  it("falls back to the snapshot name once the template is deleted", () => {
    const summaries = splitSummaries([
      workout({
        splitName: null,
        programName: null,
        splitNameSnapshot: "Legs",
      }),
    ]);
    expect(summaries[0]).toMatchObject({
      splitName: "Legs",
      programName: "Plan A",
      stillExists: false,
    });
  });

  it("excludes incomplete and one-time workouts and includes an alternate", () => {
    const summaries = splitSummaries([
      workout({ status: "incomplete", activeDurationSeconds: 99_999 }),
      workout({ sourceKind: "one_time", activeDurationSeconds: 99_999 }),
      workout({ sourceKind: "alternate_split", activeDurationSeconds: 1_800 }),
      workout({ activeDurationSeconds: 3_600 }),
    ]);
    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.completedWorkoutCount).toBe(2);
    expect(summaries[0]?.totalDurationSeconds).toBe(5_400);
  });

  it("derives every duration statistic and the latest date", () => {
    const summaries = splitSummaries([
      workout({ workoutDate: "2026-08-01", activeDurationSeconds: 3_000 }),
      workout({ workoutDate: "2026-08-08", activeDurationSeconds: 4_200 }),
      workout({ workoutDate: "2026-08-15", activeDurationSeconds: 3_600 }),
    ]);
    expect(summaries[0]).toMatchObject({
      completedWorkoutCount: 3,
      totalDurationSeconds: 10_800,
      averageDurationSeconds: 3_600,
      shortestDurationSeconds: 3_000,
      longestDurationSeconds: 4_200,
      latestDurationSeconds: 3_600,
      latestWorkoutDate: "2026-08-15",
    });
  });

  it("handles a split with a single workout", () => {
    const summaries = splitSummaries([
      workout({ activeDurationSeconds: 2_400 }),
    ]);
    expect(summaries[0]).toMatchObject({
      completedWorkoutCount: 1,
      averageDurationSeconds: 2_400,
      shortestDurationSeconds: 2_400,
      longestDurationSeconds: 2_400,
    });
  });
});

describe("program options", () => {
  it("lists each program once, by name", () => {
    const options = programOptions(
      splitSummaries([
        workout({ splitIdentityId: pushA }),
        workout({
          splitIdentityId: pullA,
          splitNameSnapshot: "Pull",
          splitName: "Pull",
        }),
        workout({
          splitIdentityId: pushB,
          programIdentityId: planB,
          programName: "Plan B",
          programNameSnapshot: "Plan B",
        }),
      ]),
    );
    expect(options.map((option) => option.programName)).toEqual([
      "Plan A",
      "Plan B",
    ]);
  });
});

describe("split workouts and duration series", () => {
  const workouts = [
    workout({ workoutDate: "2026-05-01", activeDurationSeconds: 3_000 }),
    workout({ workoutDate: "2026-08-20", activeDurationSeconds: 4_200 }),
    workout({ workoutDate: "2026-09-04", activeDurationSeconds: 3_600 }),
    workout({ workoutDate: "2026-09-05", status: "incomplete" }),
    workout({ workoutDate: "2026-09-05", splitIdentityId: pullA }),
  ];

  it("lists only the split's eligible workouts, newest first", () => {
    const entries = splitWorkouts(workouts, pushA);
    expect(entries.map((entry) => entry.workoutDate)).toEqual([
      "2026-09-04",
      "2026-08-20",
      "2026-05-01",
    ]);
  });

  it("keeps only workouts inside a trailing range", () => {
    // Windows end on the local date: week from 2026-08-30, month from
    // 2026-08-05, quarter from 2026-06-05, year from 2025-09-05.
    expect(
      durationSeries(workouts, pushA, "week", "2026-09-05").points,
    ).toHaveLength(1);
    expect(
      durationSeries(workouts, pushA, "month", "2026-09-05").points,
    ).toHaveLength(2);
    expect(
      durationSeries(workouts, pushA, "quarter", "2026-09-05").points,
    ).toHaveLength(2);
    expect(
      durationSeries(workouts, pushA, "year", "2026-09-05").points,
    ).toHaveLength(3);
    expect(
      durationSeries(workouts, pushA, "all", "2026-09-05").points,
    ).toHaveLength(3);
  });

  it("orders points by date with the duration as the value", () => {
    const series = durationSeries(workouts, pushA, "all", "2026-09-05");
    expect(series.points.map((point) => point.value)).toEqual([
      3_000, 4_200, 3_600,
    ]);
    expect(series.lowerIsBetter).toBe(false);
  });
});
