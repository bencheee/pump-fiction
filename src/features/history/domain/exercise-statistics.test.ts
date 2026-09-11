import { describe, expect, it } from "vitest";
import type { WorkoutSet } from "@/features/active-workout/domain/workout";
import { rangeStart } from "./chart";
import {
  availableMetrics,
  categoryOf,
  chartSeries,
  isEligiblePerformance,
  isRecordedSet,
  latestEligiblePerformance,
  personalRecords,
  type ExercisePerformance,
} from "./exercise-statistics";

let sequence = 0;
function set(values: Partial<WorkoutSet>): WorkoutSet {
  sequence += 1;
  return {
    id: `33000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    position: values.position ?? 1,
    loadMode: values.loadMode ?? null,
    loadKg: values.loadKg ?? null,
    bandDirection: values.bandDirection ?? null,
    bandStrength: values.bandStrength ?? null,
    reps: values.reps ?? null,
  };
}

function performance(
  values: Partial<ExercisePerformance> & { sets: readonly WorkoutSet[] },
): ExercisePerformance {
  return {
    workoutId: values.workoutId ?? "33000000-0000-4000-8000-0000000000a1",
    workoutExerciseId:
      values.workoutExerciseId ?? "33000000-0000-4000-8000-0000000000b1",
    workoutDate: values.workoutDate ?? "2026-08-10",
    workoutName: values.workoutName ?? "Push",
    status: values.status ?? "completed",
    sourceKind: values.sourceKind ?? "proposed_split",
    workoutNote: values.workoutNote ?? "",
    sets: values.sets,
  };
}

function recordsOf(
  performances: readonly ExercisePerformance[],
  categoryKey: string,
) {
  const category = personalRecords(performances).find(
    (entry) => entry.category.key === categoryKey,
  );
  if (!category) throw new Error(`No category ${categoryKey}`);
  return Object.fromEntries(
    category.records.map((record) => [record.key, record]),
  );
}

describe("recorded sets and eligibility", () => {
  it("treats a set as recorded once its mode has everything it needs", () => {
    expect(
      isRecordedSet(set({ loadMode: "weight", loadKg: 60, reps: 8 })),
    ).toBe(true);
    expect(isRecordedSet(set({ loadMode: "weight", reps: 8 }))).toBe(false);
    expect(isRecordedSet(set({ loadMode: "bodyweight", reps: 8 }))).toBe(true);
    expect(
      isRecordedSet(
        set({
          loadMode: "assistance_band",
          bandDirection: "assistance",
          reps: 8,
        }),
      ),
    ).toBe(false);
  });

  it("includes a completed one-time workout", () => {
    const sets = [set({ loadMode: "weight", loadKg: 60, reps: 8 })];
    expect(
      isEligiblePerformance(
        performance({ sets, status: "completed", sourceKind: "one_time" }),
      ),
    ).toBe(true);
  });
});

describe("comparison categories", () => {
  it("separates a no-band set from each band strength", () => {
    const plain = categoryOf(set({ loadMode: "weight", loadKg: 60, reps: 8 }));
    const light = categoryOf(
      set({
        loadMode: "weight_resistance_band",
        loadKg: 60,
        bandDirection: "resistance",
        bandStrength: "light",
        reps: 8,
      }),
    );
    const strong = categoryOf(
      set({
        loadMode: "weight_resistance_band",
        loadKg: 60,
        bandDirection: "resistance",
        bandStrength: "strong",
        reps: 8,
      }),
    );
    expect(new Set([plain?.key, light?.key, strong?.key]).size).toBe(3);
    expect(light?.bandDirection).toBe("resistance");
  });

  it("never merges assistance and resistance of the same strength", () => {
    const resistance = categoryOf(
      set({
        loadMode: "bodyweight_resistance_band",
        bandDirection: "resistance",
        bandStrength: "medium",
        reps: 8,
      }),
    );
    const assistance = categoryOf(
      set({
        loadMode: "assistance_band",
        bandDirection: "assistance",
        bandStrength: "medium",
        reps: 8,
      }),
    );
    expect(resistance?.key).not.toBe(assistance?.key);
  });
});

describe("personal records", () => {
  it("derives the weights records the product document defines", () => {
    const performances = [
      performance({
        workoutId: "33000000-0000-4000-8000-0000000000a1",
        workoutDate: "2026-08-10",
        sets: [
          set({ loadMode: "weight", loadKg: 60, reps: 8, position: 1 }),
          set({ loadMode: "weight", loadKg: 80, reps: 3, position: 2 }),
        ],
      }),
      performance({
        workoutId: "33000000-0000-4000-8000-0000000000a2",
        workoutDate: "2026-08-17",
        sets: [
          set({ loadMode: "weight", loadKg: 70, reps: 10, position: 1 }),
          set({ loadMode: "weight", loadKg: 70, reps: 9, position: 2 }),
        ],
      }),
    ];
    const records = recordsOf(performances, "weight");
    expect(records.highest_load?.value).toBe(80);
    expect(records.highest_reps?.value).toBe(10);
    expect(records.highest_set_volume?.value).toBe(700);
    // 70 × 10 + 70 × 9 beats 60 × 8 + 80 × 3.
    expect(records.highest_workout_volume?.value).toBe(1330);
  });

  it("reports the highest reps at each distinct load, heaviest first", () => {
    const performances = [
      performance({
        sets: [
          set({ loadMode: "weight", loadKg: 60, reps: 8, position: 1 }),
          set({ loadMode: "weight", loadKg: 60, reps: 11, position: 2 }),
          set({ loadMode: "weight", loadKg: 80, reps: 3, position: 3 }),
        ],
      }),
    ];
    const category = personalRecords(performances).find(
      (entry) => entry.category.key === "weight",
    );
    expect(category?.repsByLoad).toEqual([
      expect.objectContaining({ load: 80, reps: 3 }),
      expect.objectContaining({ load: 60, reps: 11 }),
    ]);
  });

  it("derives pure bodyweight records from reps alone", () => {
    const performances = [
      performance({
        sets: [
          set({ loadMode: "bodyweight", reps: 12, position: 1 }),
          set({ loadMode: "bodyweight", reps: 9, position: 2 }),
        ],
      }),
    ];
    const records = recordsOf(performances, "bodyweight");
    expect(records.highest_load).toBeUndefined();
    expect(records.highest_reps?.value).toBe(12);
    expect(records.highest_workout_reps?.value).toBe(21);
  });

  it("treats less assistance as the record and says so", () => {
    const performances = [
      performance({
        sets: [
          set({
            loadMode: "assistance_weight",
            loadKg: 20,
            reps: 8,
            position: 1,
          }),
          set({
            loadMode: "assistance_weight",
            loadKg: 12,
            reps: 6,
            position: 2,
          }),
        ],
      }),
    ];
    const records = recordsOf(performances, "assistance_weight");
    expect(records.least_load?.value).toBe(12);
    expect(records.least_load?.lowerIsBetter).toBe(true);
    expect(records.highest_set_volume).toBeUndefined();
  });

  it("keeps band categories apart in the derived records", () => {
    const performances = [
      performance({
        sets: [
          set({
            loadMode: "bodyweight_resistance_band",
            bandDirection: "resistance",
            bandStrength: "light",
            reps: 12,
            position: 1,
          }),
          set({
            loadMode: "bodyweight_resistance_band",
            bandDirection: "resistance",
            bandStrength: "strong",
            reps: 5,
            position: 2,
          }),
        ],
      }),
    ];
    const categories = personalRecords(performances);
    expect(categories).toHaveLength(2);
    expect(
      recordsOf(performances, "bodyweight_resistance_band:light").highest_reps
        ?.value,
    ).toBe(12);
    expect(
      recordsOf(performances, "bodyweight_resistance_band:strong").highest_reps
        ?.value,
    ).toBe(5);
  });
});

describe("latest eligible performance", () => {
  it("returns null when nothing counts yet", () => {
    expect(
      latestEligiblePerformance([performance({ sets: [set({ reps: 8 })] })]),
    ).toBeNull();
  });
});

describe("chart series", () => {
  const performances = [
    performance({
      workoutId: "33000000-0000-4000-8000-0000000000a1",
      workoutDate: "2026-05-01",
      sets: [set({ loadMode: "weight", loadKg: 50, reps: 10 })],
    }),
    performance({
      workoutId: "33000000-0000-4000-8000-0000000000a2",
      workoutDate: "2026-08-20",
      sets: [set({ loadMode: "weight", loadKg: 70, reps: 6 })],
    }),
    performance({
      workoutId: "33000000-0000-4000-8000-0000000000a3",
      workoutDate: "2026-09-04",
      sets: [
        set({ loadMode: "weight", loadKg: 60, reps: 8, position: 1 }),
        set({ loadMode: "weight", loadKg: 80, reps: 2, position: 2 }),
      ],
    }),
  ];

  it("returns one ordered point per eligible workout", () => {
    const series = chartSeries(performances, "top_load", "all", "2026-09-05");
    expect(series.points.map((point) => point.value)).toEqual([50, 70, 80]);
    expect(series.lowerIsBetter).toBe(false);
  });

  it("keeps only workouts inside a trailing range", () => {
    // The windows end on the local date: week reaches back to 2026-08-30,
    // month to 2026-08-05, quarter to 2026-06-05, and year to 2025-09-05.
    expect(
      chartSeries(performances, "top_load", "week", "2026-09-05").points,
    ).toHaveLength(1);
    expect(
      chartSeries(performances, "top_load", "month", "2026-09-05").points,
    ).toHaveLength(2);
    expect(
      chartSeries(performances, "top_load", "quarter", "2026-09-05").points,
    ).toHaveLength(2);
    expect(
      chartSeries(performances, "top_load", "year", "2026-09-05").points,
    ).toHaveLength(3);
  });

  it("includes a workout falling exactly on the window boundary", () => {
    const boundary = [
      performance({
        workoutId: "33000000-0000-4000-8000-0000000000b9",
        workoutDate: "2026-08-30",
        sets: [set({ loadMode: "weight", loadKg: 55, reps: 5 })],
      }),
    ];
    expect(
      chartSeries(boundary, "top_load", "week", "2026-09-05").points,
    ).toHaveLength(1);
  });

  it("sums volume per workout", () => {
    const series = chartSeries(
      performances,
      "total_volume",
      "week",
      "2026-09-05",
    );
    expect(series.points[0]?.value).toBe(640);
  });

  it("marks an assistance series as lower-is-better", () => {
    const series = chartSeries(
      [
        performance({
          sets: [set({ loadMode: "assistance_weight", loadKg: 15, reps: 8 })],
        }),
      ],
      "least_load",
      "all",
      "2026-09-05",
    );
    expect(series.lowerIsBetter).toBe(true);
    expect(series.points[0]?.value).toBe(15);
  });

  it("computes a trailing range boundary from the local date", () => {
    expect(rangeStart("week", "2026-09-05")).toBe("2026-08-30");
    expect(rangeStart("month", "2026-09-05")).toBe("2026-08-05");
    expect(rangeStart("year", "2026-09-05")).toBe("2025-09-05");
    expect(rangeStart("all", "2026-09-05")).toBeNull();
  });
});

describe("available metrics", () => {
  it("offers the load first for an exercise that moves one", () => {
    expect(
      availableMetrics([
        performance({
          sets: [set({ loadMode: "weight", loadKg: 60, reps: 8 })],
        }),
      ])[0],
    ).toBe("top_load");
    expect(
      availableMetrics([
        performance({
          sets: [set({ loadMode: "assistance_weight", loadKg: 15, reps: 8 })],
        }),
      ])[0],
    ).toBe("least_load");
    // Nothing to weigh, so reps lead.
    expect(
      availableMetrics([
        performance({ sets: [set({ loadMode: "bodyweight", reps: 8 })] }),
      ])[0],
    ).toBe("top_reps");
  });

  it("offers load and volume for weights and reps totals for bodyweight", () => {
    expect(
      availableMetrics([
        performance({
          sets: [set({ loadMode: "weight", loadKg: 60, reps: 8 })],
        }),
      ]),
    ).toEqual(expect.arrayContaining(["top_reps", "top_load", "total_volume"]));
    expect(
      availableMetrics([
        performance({ sets: [set({ loadMode: "bodyweight", reps: 8 })] }),
      ]),
    ).toEqual(expect.arrayContaining(["top_reps", "total_reps"]));
    expect(
      availableMetrics([
        performance({
          sets: [set({ loadMode: "assistance_weight", loadKg: 15, reps: 8 })],
        }),
      ]),
    ).toEqual(expect.arrayContaining(["least_load"]));
  });
});
