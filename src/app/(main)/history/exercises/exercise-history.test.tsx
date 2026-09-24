// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ExerciseStatistics } from "@/features/history/application/exercise-statistics-operations";
import type {
  ExerciseHistoryEntry,
  ExercisePerformance,
} from "@/features/history/domain/exercise-statistics";

import { ExerciseStatisticsView } from "./[id]/exercise-statistics-view";
import { ExerciseHistoryList } from "./exercise-history-list";

const actions = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock("@/app/actions/workout-history", () => ({
  getExerciseStatisticsAction: actions.load,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/history/exercises",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const pressId = "34000000-0000-4000-8000-000000000001";
const ghostId = "34000000-0000-4000-8000-000000000002";
const workoutId = "34000000-0000-4000-8000-000000000010";
const olderWorkoutId = "34000000-0000-4000-8000-000000000011";

const latest: ExercisePerformance = {
  workoutId,
  workoutExerciseId: "34000000-0000-4000-8000-000000000020",
  workoutDate: "2026-08-09",
  workoutName: "Push",
  status: "completed",
  sourceKind: "proposed_split",
  measurementType: "reps",
  workoutNote: "Felt strong",
  sets: [
    {
      id: "34000000-0000-4000-8000-000000000030",
      position: 1,
      loadMode: "weight",
      loadKg: 80,
      bandDirection: null,
      bandStrength: null,
      reps: 3,
    },
    {
      id: "34000000-0000-4000-8000-000000000031",
      position: 2,
      loadMode: "weight",
      loadKg: 60,
      bandDirection: null,
      bandStrength: null,
      reps: 8,
    },
  ],
};

const older: ExercisePerformance = {
  workoutId: olderWorkoutId,
  workoutExerciseId: "34000000-0000-4000-8000-000000000021",
  workoutDate: "2026-03-01",
  workoutName: "Push",
  status: "completed",
  sourceKind: "proposed_split",
  measurementType: "reps",
  workoutNote: "",
  sets: [
    {
      id: "34000000-0000-4000-8000-000000000032",
      position: 1,
      loadMode: "weight",
      loadKg: 50,
      bandDirection: null,
      bandStrength: null,
      reps: 10,
    },
  ],
};

const entries: readonly ExerciseHistoryEntry[] = [
  {
    exerciseIdentityId: pressId,
    exerciseName: "Bench press",
    exerciseBaseType: "weights",
    stillInLibrary: true,
    performanceCount: 2,
    latestPerformance: latest,
  },
  {
    exerciseIdentityId: ghostId,
    exerciseName: "Cable row",
    exerciseBaseType: "weights",
    stillInLibrary: false,
    performanceCount: 0,
    latestPerformance: null,
  },
];

const statistics: ExerciseStatistics = {
  exerciseIdentityId: pressId,
  exerciseName: "Bench press",
  exerciseBaseType: "weights",
  stillInLibrary: true,
  latestPerformance: latest,
  categories: [
    {
      category: {
        key: "weight",
        label: "Weight",
        loadMode: "weight",
        bandDirection: null,
        bandStrength: null,
      },
      records: [
        {
          key: "highest_load",
          label: "Highest load",
          value: 80,
          unit: "kg",
          reps: 3,
          lowerIsBetter: false,
          workoutId,
          workoutDate: "2026-08-09",
        },
        {
          key: "highest_workout_volume",
          label: "Best workout volume",
          value: 1240,
          unit: "volume",
          reps: null,
          lowerIsBetter: false,
          workoutId,
          workoutDate: "2026-08-09",
        },
      ],
      repsByLoad: [
        { load: 80, reps: 3, workoutId, workoutDate: "2026-08-09" },
        { load: 60, reps: 8, workoutId, workoutDate: "2026-08-09" },
      ],
    },
    {
      category: {
        key: "assistance_weight",
        label: "Assistance",
        loadMode: "assistance_weight",
        bandDirection: null,
        bandStrength: null,
      },
      records: [
        {
          key: "least_load",
          label: "Least assistance",
          value: 12,
          unit: "kg",
          reps: 6,
          lowerIsBetter: true,
          workoutId,
          workoutDate: "2026-08-09",
        },
      ],
      repsByLoad: [],
    },
  ],
  metrics: ["top_reps", "top_load", "total_volume"],
  performances: [latest, older],
  // What the server computed for the first paint: the highest load of every
  // completed performance above, oldest first.
  series: {
    metric: "top_load",
    label: "Highest load",
    unit: "kg",
    lowerIsBetter: false,
    points: [
      { workoutId: olderWorkoutId, date: "2026-03-01", value: 50 },
      { workoutId, date: "2026-08-09", value: 80 },
    ],
  },
};

function renderStatistics(value: ExerciseStatistics = statistics) {
  return render(
    <ExerciseStatisticsView statistics={value} localDate="2026-09-05" />,
  );
}

function barHeight(bar: HTMLElement): number {
  return Number.parseFloat(bar.style.getPropertyValue("--bar-height"));
}

beforeEach(() => {
  actions.load.mockReset();
});
afterEach(cleanup);

describe("exercise history list", () => {
  it("filters the loaded list and marks a deleted definition", async () => {
    const user = userEvent.setup();
    render(<ExerciseHistoryList entries={entries} />);

    const cableRow = screen.getByRole("link", { name: /Cable row/ });
    expect(cableRow).toHaveAttribute("href", `/history/exercises/${ghostId}`);
    expect(
      within(cableRow).getByText("No longer in the library"),
    ).toBeInTheDocument();
    expect(
      within(cableRow).getByText("No eligible performance yet"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("link", { name: /Bench press/ })).queryByText(
        "No longer in the library",
      ),
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", { name: "Filter exercises by name" }),
      "cable",
    );
    expect(
      screen.queryByRole("link", { name: /Bench press/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Cable row/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("summarises the latest performance by its heaviest set and counts the performances", () => {
    render(<ExerciseHistoryList entries={entries} />);

    // Step 8 of docs/design/redesign-v2/PLAN.md: the best set is the heaviest
    // by volume (60 × 8 over 80 × 3), and `· N performances` joins the row.
    const bench = screen.getByRole("link", { name: /Bench press/ });
    expect(bench).toHaveAttribute("href", `/history/exercises/${pressId}`);
    expect(
      within(bench).getByText("Sun 9 Aug · 60 kg × 8 · 2 performances"),
    ).toBeInTheDocument();
  });

  it("explains an empty search result without emptying the screen", async () => {
    const user = userEvent.setup();
    render(<ExerciseHistoryList entries={entries} />);

    await user.type(
      screen.getByRole("searchbox", { name: "Filter exercises by name" }),
      "deadlift",
    );
    expect(
      screen.getByText("No exercise with a recorded set matches that name."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Filter exercises by name" }),
    ).toHaveValue("deadlift");
  });

  it("shows the empty state when nothing has been recorded", () => {
    render(<ExerciseHistoryList entries={[]} />);
    expect(
      screen.getByText(
        "No exercise history yet. Record a set in a workout and that exercise appears here.",
      ),
    ).toBeInTheDocument();
  });
});

describe("exercise progress detail", () => {
  it("groups records by comparison category and marks lower-is-better", () => {
    renderStatistics();

    const weight = screen.getByRole("region", { name: "Weight" });
    expect(within(weight).getByText("Highest load")).toBeInTheDocument();
    expect(within(weight).getByText("80 kg × 3")).toBeInTheDocument();
    // A volume carries its reps inside the product, so it states it alone.
    expect(within(weight).getByText("1,240 kg·reps")).toBeInTheDocument();
    expect(
      within(weight).queryByText(/less is better/),
    ).not.toBeInTheDocument();

    const assistance = screen.getByRole("region", { name: "Assistance" });
    expect(within(assistance).getByText(/less is better/)).toBeInTheDocument();
    expect(within(assistance).getByText("12 kg × 6")).toBeInTheDocument();
  });

  it("states the latest performance above the records", () => {
    renderStatistics();

    expect(screen.getByText("Latest performance")).toBeInTheDocument();
    expect(screen.getAllByText("80 kg × 3, 60 kg × 8")).toHaveLength(2);
  });

  it("offers the highest reps at each load as a data list", async () => {
    const user = userEvent.setup();
    renderStatistics();

    const toggle = screen.getByRole("button", {
      name: "Highest reps at each load",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    // The same load reads "80 kg" in the chart-values list too, so each list
    // is addressed by its own name.
    const loads = screen.getByRole("list", {
      name: "Highest reps at each load, Weight",
    });
    expect(within(loads).getByText("80 kg")).toBeInTheDocument();
    expect(within(loads).getByText("8 reps")).toBeInTheDocument();
    // A category with no reps-by-load rows offers no list at all.
    expect(
      within(screen.getByRole("region", { name: "Assistance" })).queryByRole(
        "button",
        { name: "Highest reps at each load" },
      ),
    ).not.toBeInTheDocument();
  });

  it("summarises the series in words and lists every value", async () => {
    const user = userEvent.setup();
    renderStatistics();

    // The prototype's `chartSummary` (step 11) replaced the old sentence.
    expect(
      screen.getByText(
        "2 workouts in range: 50 kg to 80 kg, best 80 kg. Moving in the better direction.",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Chart values" }));
    const values = screen.getByRole("list", { name: "Chart values" });
    const rows = within(values).getAllByRole("listitem");
    // Newest first, the reverse of the bars.
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("80 kg")).toBeInTheDocument();
    expect(within(rows[1]).getByText("50 kg")).toBeInTheDocument();
  });

  it("draws one bar per point and reads out the one pressed", async () => {
    const user = userEvent.setup();
    renderStatistics();

    const latestBar = screen.getByRole("button", { name: "Sun 9 Aug · 80 kg" });
    const olderBar = screen.getByRole("button", { name: "Sun 1 Mar · 50 kg" });
    // The reading opens on the most recent point.
    expect(latestBar).toHaveAttribute("aria-pressed", "true");
    expect(olderBar).toHaveAttribute("aria-pressed", "false");
    expect(barHeight(latestBar)).toBeGreaterThan(barHeight(olderBar));

    await user.click(olderBar);

    expect(olderBar).toHaveAttribute("aria-pressed", "true");
    expect(latestBar).toHaveAttribute("aria-pressed", "false");
  });

  it("recomputes the series in place when the metric or the range changes", async () => {
    const user = userEvent.setup();
    renderStatistics();

    const metric = within(screen.getByRole("group", { name: "Metric" }));
    const range = within(screen.getByRole("group", { name: "Time range" }));
    expect(
      metric.getByRole("button", { name: "Highest load" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(range.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(metric.getByRole("button", { name: "Workout volume" }));

    expect(
      metric.getByRole("button", { name: "Workout volume" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText(
        "2 workouts in range: 500 kg·reps to 720 kg·reps, best 720 kg·reps. Moving in the better direction.",
      ),
    ).toBeInTheDocument();

    // The metric stays chosen while the range narrows to the last quarter,
    // which leaves the March workout out.
    await user.click(range.getByRole("button", { name: "Quarter" }));

    expect(range.getByRole("button", { name: "Quarter" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText(
        "1 workout in range: 720 kg·reps to 720 kg·reps, best 720 kg·reps. Unchanged over this range.",
      ),
    ).toBeInTheDocument();

    await user.click(range.getByRole("button", { name: "Week" }));

    expect(
      screen.getByText("No workout falls inside this range."),
    ).toBeInTheDocument();

    // Step 11 of docs/design/redesign-v2/PLAN.md: the chips answer in the same
    // frame from the performances already on the screen, where they used to
    // ask the server for each new series.
    expect(actions.load).not.toHaveBeenCalled();
  });

  it("treats less assistance as progress in the chart", () => {
    renderStatistics({
      ...statistics,
      metrics: ["least_load"],
      series: {
        metric: "least_load",
        label: "Least assistance",
        unit: "kg",
        lowerIsBetter: true,
        points: [
          { workoutId: olderWorkoutId, date: "2026-08-02", value: 20 },
          { workoutId, date: "2026-08-09", value: 12.5 },
        ],
      },
    });

    expect(
      screen.getByText(
        "2 workouts in range: 20 kg to 12.5 kg, best 12.5 kg. Moving in the better direction.",
      ),
    ).toBeInTheDocument();
    const better = screen.getByRole("button", { name: "Sun 9 Aug · 12.5 kg" });
    const worse = screen.getByRole("button", { name: "Sun 2 Aug · 20 kg" });
    expect(barHeight(better)).toBeGreaterThan(barHeight(worse));
  });

  it("says when assistance rose over the range", () => {
    renderStatistics({
      ...statistics,
      metrics: ["least_load"],
      series: {
        metric: "least_load",
        label: "Least assistance",
        unit: "kg",
        lowerIsBetter: true,
        points: [
          { workoutId: olderWorkoutId, date: "2026-08-02", value: 12.5 },
          { workoutId, date: "2026-08-09", value: 20 },
        ],
      },
    });

    expect(
      screen.getByText(
        "2 workouts in range: 12.5 kg to 20 kg, best 12.5 kg. Above where the range started.",
      ),
    ).toBeInTheDocument();
  });

  it("links each performance to its workout", () => {
    renderStatistics();

    const link = screen.getByRole("link", { name: "Sun 9 Aug · Push" });
    expect(link).toHaveAttribute("href", `/history/workouts/${workoutId}`);
    expect(within(link).getByText("Workout note: Felt strong")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Sun 1 Mar · Push" }),
    ).toHaveAttribute("href", `/history/workouts/${olderWorkoutId}`);
  });

  it("answers an exercise with nothing to count in note cards", () => {
    renderStatistics({
      ...statistics,
      exerciseName: "Cable row",
      stillInLibrary: false,
      latestPerformance: null,
      categories: [],
      metrics: [],
      performances: [],
      series: { ...statistics.series, points: [] },
    });

    expect(screen.getByText("No longer in the library")).toBeInTheDocument();
    expect(screen.getByText("Nothing counts yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Records appear once a completed workout holds a recorded set.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "A completed workout with recorded sets starts the chart.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This exercise has no saved performance yet."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Metric" }),
    ).not.toBeInTheDocument();
  });
});
