// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  SplitHistory,
  SplitStatistics,
} from "@/features/history/application/split-statistics-operations";

import { SplitStatisticsView } from "./[id]/split-statistics-view";
import { SplitHistoryList } from "./split-history-list";

const actions = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock("@/app/actions/workout-history", () => ({
  getSplitStatisticsAction: actions.load,
}));
// The chart draws the same series the accessible list shows, and Recharts needs
// a laid-out container jsdom does not provide; the browser scenario covers it.
vi.mock("@/features/history/ui/progress-chart", () => ({
  ProgressChart: () => null,
}));

const planA = "36000000-0000-4000-8000-0000000000a0";
const planB = "36000000-0000-4000-8000-0000000000b0";
const pushA = "36000000-0000-4000-8000-0000000000a1";
const pushB = "36000000-0000-4000-8000-0000000000b1";
const workoutId = "36000000-0000-4000-8000-000000000010";

const history: SplitHistory = {
  splits: [
    {
      splitIdentityId: pushA,
      programIdentityId: planA,
      splitName: "Push",
      programName: "Plan A",
      stillExists: true,
      completedWorkoutCount: 3,
      totalDurationSeconds: 10_800,
      averageDurationSeconds: 3_600,
      shortestDurationSeconds: 3_000,
      longestDurationSeconds: 4_200,
      latestDurationSeconds: 3_600,
      latestWorkoutDate: "2026-08-15",
    },
    {
      splitIdentityId: pushB,
      programIdentityId: planB,
      splitName: "Push",
      programName: "Plan B",
      stillExists: false,
      completedWorkoutCount: 1,
      totalDurationSeconds: 2_400,
      averageDurationSeconds: 2_400,
      shortestDurationSeconds: 2_400,
      longestDurationSeconds: 2_400,
      latestDurationSeconds: 2_400,
      latestWorkoutDate: "2026-08-01",
    },
  ],
  programs: [
    { programIdentityId: planA, programName: "Plan A" },
    { programIdentityId: planB, programName: "Plan B" },
  ],
};

const statistics: SplitStatistics = {
  summary: history.splits[0]!,
  workouts: [
    { workoutId, workoutDate: "2026-08-15", activeDurationSeconds: 3_600 },
    {
      workoutId: "36000000-0000-4000-8000-000000000011",
      workoutDate: "2026-08-08",
      activeDurationSeconds: 4_200,
    },
  ],
  series: {
    metric: "duration",
    label: "Active duration",
    unit: "seconds",
    lowerIsBetter: false,
    points: [
      {
        workoutId: "36000000-0000-4000-8000-000000000011",
        date: "2026-08-08",
        value: 4_200,
      },
      { workoutId, date: "2026-08-15", value: 3_600 },
    ],
  },
};

beforeEach(() => {
  actions.load.mockReset();
  actions.load.mockResolvedValue({ ok: true, value: statistics });
});
afterEach(cleanup);

describe("split history list", () => {
  it("keeps same-named splits apart and filters by program", async () => {
    const user = userEvent.setup();
    render(<SplitHistoryList history={history} />);

    expect(screen.getAllByRole("link", { name: /Push/ })).toHaveLength(2);
    expect(
      screen.getByText(/Plan A · 3 workouts · avg 1 h/),
    ).toBeInTheDocument();
    expect(screen.getByText("No longer in the program")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Plan B" }));
    expect(screen.getAllByRole("link", { name: /Push/ })).toHaveLength(1);
    expect(screen.getByText(/Plan B · 1 workout/)).toBeInTheDocument();
  });

  it("shows the empty state when nothing has been completed", () => {
    render(<SplitHistoryList history={{ splits: [], programs: [] }} />);
    expect(screen.getByText("No split history yet")).toBeInTheDocument();
  });
});

describe("split progress detail", () => {
  it("shows all six duration statistics and the exclusion rule", () => {
    render(
      <SplitStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

    // The same duration also appears in the value list and the workout list,
    // so each statistic is read from its own card.
    const card = (label: string) => {
      const section = screen.getByText(label).closest("section");
      if (!section) throw new Error(`No card for ${label}`);
      return within(section);
    };
    expect(card("Completed").getByText("3")).toBeInTheDocument();
    expect(card("Average").getByText("1 h")).toBeInTheDocument();
    expect(card("Shortest").getByText("50 min")).toBeInTheDocument();
    expect(card("Longest").getByText("1 h 10 min")).toBeInTheDocument();
    expect(card("Latest").getByText("1 h")).toBeInTheDocument();
    expect(card("Total").getByText("3 h")).toBeInTheDocument();
    expect(
      screen.getByText(/One-time workouts are excluded/),
    ).toBeInTheDocument();
  });

  it("summarises the series in words and lists every value", async () => {
    const user = userEvent.setup();
    render(
      <SplitStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

    expect(
      screen.getByText(/Active duration across 2 workouts: 1 h 10 min to 1 h/),
    ).toBeInTheDocument();
    await user.click(screen.getByText("Chart values"));
    const values = screen.getByRole("list", { name: "Chart values" });
    expect(within(values).getByText("1 h 10 min")).toBeInTheDocument();
  });

  it("reloads the series when the range changes", async () => {
    const user = userEvent.setup();
    render(
      <SplitStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

    await user.click(screen.getByRole("button", { name: "Quarter" }));
    expect(actions.load).toHaveBeenCalledWith(pushA, {
      range: "quarter",
      localDate: "2026-09-05",
    });
  });

  it("links each workout to its detail", () => {
    render(
      <SplitStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );
    const workouts = screen.getByRole("list", { name: "Split workouts" });
    expect(
      within(workouts).getByRole("link", { name: /Sat 15 Aug/ }),
    ).toHaveAttribute("href", `/history/workouts/${workoutId}`);
  });
});
