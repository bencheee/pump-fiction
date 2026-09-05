// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ExerciseStatistics } from "@/features/history/application/exercise-statistics-operations";
import type { ExerciseHistoryEntry } from "@/features/history/domain/exercise-statistics";

import { ExerciseStatisticsView } from "./[id]/exercise-statistics-view";
import { ExerciseHistoryList } from "./exercise-history-list";

const actions = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock("@/app/actions/workout-history", () => ({
  getExerciseStatisticsAction: actions.load,
}));
// The chart is presentation over the same series the accessible list shows, and
// Recharts needs a laid-out container that jsdom does not provide. The browser
// scenario covers it; here the data beside it is what matters.
vi.mock("./[id]/progress-chart", () => ({
  ProgressChart: () => null,
}));

const pressId = "34000000-0000-4000-8000-000000000001";
const ghostId = "34000000-0000-4000-8000-000000000002";
const workoutId = "34000000-0000-4000-8000-000000000010";

const entries: readonly ExerciseHistoryEntry[] = [
  {
    exerciseIdentityId: pressId,
    exerciseName: "Bench press",
    exerciseBaseType: "weights",
    stillInLibrary: true,
    latestPerformance: {
      workoutId,
      workoutExerciseId: "34000000-0000-4000-8000-000000000020",
      workoutDate: "2026-08-09",
      workoutName: "Push",
      status: "completed",
      sourceKind: "proposed_split",
      workoutNote: "",
      sets: [
        {
          id: "34000000-0000-4000-8000-000000000030",
          position: 1,
          loadMode: "weight",
          loadKg: 60,
          bandDirection: null,
          bandStrength: null,
          reps: 8,
        },
      ],
    },
  },
  {
    exerciseIdentityId: ghostId,
    exerciseName: "Cable row",
    exerciseBaseType: "weights",
    stillInLibrary: false,
    latestPerformance: null,
  },
];

const statistics: ExerciseStatistics = {
  exerciseIdentityId: pressId,
  exerciseName: "Bench press",
  exerciseBaseType: "weights",
  stillInLibrary: true,
  latestPerformance: entries[0]?.latestPerformance ?? null,
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
  performances: [
    {
      workoutId,
      workoutExerciseId: "34000000-0000-4000-8000-000000000020",
      workoutDate: "2026-08-09",
      workoutName: "Push",
      status: "completed",
      sourceKind: "proposed_split",
      workoutNote: "Felt strong",
      sets: [
        {
          id: "34000000-0000-4000-8000-000000000030",
          position: 1,
          loadMode: "weight",
          loadKg: 60,
          bandDirection: null,
          bandStrength: null,
          reps: 8,
        },
      ],
    },
    {
      workoutId: "34000000-0000-4000-8000-000000000011",
      workoutExerciseId: "34000000-0000-4000-8000-000000000021",
      workoutDate: "2026-09-02",
      workoutName: "Pull",
      status: "incomplete",
      sourceKind: "proposed_split",
      workoutNote: "",
      sets: [],
    },
  ],
  series: {
    metric: "top_load",
    label: "Highest load",
    unit: "kg",
    lowerIsBetter: false,
    points: [
      { workoutId, date: "2026-08-09", value: 60 },
      {
        workoutId: "34000000-0000-4000-8000-000000000012",
        date: "2026-08-16",
        value: 80,
      },
    ],
  },
};

beforeEach(() => {
  actions.load.mockReset();
  actions.load.mockResolvedValue({ ok: true, value: statistics });
});
afterEach(cleanup);

describe("exercise history list", () => {
  it("filters the loaded list and marks a deleted definition", async () => {
    const user = userEvent.setup();
    render(<ExerciseHistoryList entries={entries} />);

    expect(screen.getByText("No longer in the library")).toBeInTheDocument();
    expect(screen.getByText(/Sun 9 Aug · 60 kg × 8/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search"), "cable");
    expect(
      screen.queryByRole("link", { name: /Bench press/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Cable row/ })).toBeInTheDocument();
  });

  it("explains an empty search result without emptying the screen", async () => {
    const user = userEvent.setup();
    render(<ExerciseHistoryList entries={entries} />);

    await user.type(screen.getByLabelText("Search"), "deadlift");
    expect(screen.getByText("No matching exercise")).toBeInTheDocument();
  });

  it("shows the empty state when nothing has been recorded", () => {
    render(<ExerciseHistoryList entries={[]} />);
    expect(screen.getByText("No exercise history yet")).toBeInTheDocument();
  });
});

describe("exercise progress detail", () => {
  it("groups records by comparison category and marks lower-is-better", () => {
    render(
      <ExerciseStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

    const weight = screen.getByRole("region", { name: "Weight" });
    expect(within(weight).getByText("Highest load")).toBeInTheDocument();
    expect(within(weight).getByText("80 kg × 3")).toBeInTheDocument();

    const assistance = screen.getByRole("region", { name: "Assistance" });
    expect(within(assistance).getByText(/less is better/)).toBeInTheDocument();
    expect(within(assistance).getByText("12 kg × 6")).toBeInTheDocument();
  });

  it("offers the highest reps at each load as a data list", async () => {
    const user = userEvent.setup();
    render(
      <ExerciseStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

    await user.click(screen.getByText("Highest reps at each load"));
    expect(screen.getByText("80 kg")).toBeInTheDocument();
    expect(screen.getByText("8 reps")).toBeInTheDocument();
  });

  it("summarises the series in words and lists every value", async () => {
    const user = userEvent.setup();
    render(
      <ExerciseStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

    expect(
      screen.getByText(/Highest load across 2 workouts: 60 to 80 kg, best 80/),
    ).toBeInTheDocument();
    await user.click(screen.getByText("Chart values"));
    expect(screen.getByText("80 kg")).toBeInTheDocument();
  });

  it("reloads the series when the metric or the range changes", async () => {
    const user = userEvent.setup();
    render(
      <ExerciseStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

    await user.click(screen.getByRole("button", { name: "Workout volume" }));
    expect(actions.load).toHaveBeenCalledWith(pressId, {
      metric: "total_volume",
      range: "all",
      localDate: "2026-09-05",
    });

    await user.click(screen.getByRole("button", { name: "Quarter" }));
    expect(actions.load).toHaveBeenLastCalledWith(pressId, {
      metric: "top_load",
      range: "quarter",
      localDate: "2026-09-05",
    });
  });

  it("links each performance to its workout and marks the excluded one", () => {
    render(
      <ExerciseStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

    expect(
      screen.getByRole("link", { name: /Sun 9 Aug · Push/ }),
    ).toHaveAttribute("href", `/history/workouts/${workoutId}`);
    expect(screen.getByText("Incomplete")).toBeInTheDocument();
    expect(
      screen.getByText(/does not feed personal records/),
    ).toBeInTheDocument();
  });
});
