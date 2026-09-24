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

// The range chips recompute the series on the client (PLAN.md step 12); the
// action stays mocked so a regression back to a server reload is caught.
vi.mock("@/app/actions/workout-history", () => ({
  getSplitStatisticsAction: actions.load,
}));

const planA = "36000000-0000-4000-8000-0000000000a0";
const planB = "36000000-0000-4000-8000-0000000000b0";
const planC = "36000000-0000-4000-8000-0000000000c0";
const pushA = "36000000-0000-4000-8000-0000000000a1";
const pushB = "36000000-0000-4000-8000-0000000000b1";
const workoutId = "36000000-0000-4000-8000-000000000010";
const olderWorkoutId = "36000000-0000-4000-8000-000000000011";

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
      workoutId: olderWorkoutId,
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
      { workoutId: olderWorkoutId, date: "2026-08-08", value: 4_200 },
      { workoutId, date: "2026-08-15", value: 3_600 },
    ],
  },
};

const splitRows = () =>
  screen
    .queryAllByRole("link")
    .filter((link) =>
      link.getAttribute("href")?.startsWith("/history/splits/"),
    );

beforeEach(() => {
  actions.load.mockReset();
  actions.load.mockResolvedValue({ ok: true, value: statistics });
});
afterEach(cleanup);

describe("split history list", () => {
  it("keeps same-named splits apart and filters by program", async () => {
    const user = userEvent.setup();
    render(<SplitHistoryList history={history} />);

    const rows = splitRows();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("href", `/history/splits/${pushA}`);
    expect(rows[1]).toHaveAttribute("href", `/history/splits/${pushB}`);
    // The program is the row's own line above the detail (PLAN.md step 8).
    const first = within(rows[0]!);
    expect(first.getByText("Push")).toBeInTheDocument();
    expect(first.getByText("Plan A")).toBeInTheDocument();
    expect(
      first.getByText("3 workouts · avg 1 h · Sat 15 Aug"),
    ).toBeInTheDocument();
    expect(
      first.queryByText("No longer in the program"),
    ).not.toBeInTheDocument();
    expect(
      within(rows[1]!).getByText("No longer in the program"),
    ).toBeInTheDocument();

    const programs = screen.getByRole("group", { name: "Program" });
    expect(
      within(programs).getByRole("button", { name: "All programs" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(within(programs).getByRole("button", { name: "Plan B" }));
    expect(
      within(programs).getByRole("button", { name: "Plan B" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(splitRows()).toHaveLength(1);
    expect(splitRows()[0]).toHaveAttribute("href", `/history/splits/${pushB}`);
    expect(
      screen.getByText("1 workout · avg 40 min · Sat 1 Aug"),
    ).toBeInTheDocument();

    await user.click(
      within(programs).getByRole("button", { name: "All programs" }),
    );
    expect(splitRows()).toHaveLength(2);
  });

  it("hides the program filter when there is only one program", () => {
    render(
      <SplitHistoryList
        history={{
          splits: [history.splits[0]!],
          programs: [history.programs[0]!],
        }}
      />,
    );
    expect(
      screen.queryByRole("group", { name: "Program" }),
    ).not.toBeInTheDocument();
    expect(splitRows()).toHaveLength(1);
  });

  it("says when the chosen program has no split history", async () => {
    const user = userEvent.setup();
    render(
      <SplitHistoryList
        history={{
          splits: history.splits,
          programs: [
            ...history.programs,
            { programIdentityId: planC, programName: "Plan C" },
          ],
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Plan C" }));
    expect(splitRows()).toHaveLength(0);
    expect(
      screen.getByText(/No split in this program yet/),
    ).toBeInTheDocument();
  });

  it("shows the empty state when nothing has been completed", () => {
    const { container } = render(
      <SplitHistoryList history={{ splits: [], programs: [] }} />,
    );
    const note = container.querySelector("[data-note-card]");
    expect(note).toHaveTextContent(/^No split history yet\./);
    expect(splitRows()).toHaveLength(0);
  });
});

describe("split progress detail", () => {
  const renderView = () =>
    render(
      <SplitStatisticsView statistics={statistics} localDate="2026-09-05" />,
    );

  it("names the split, its program and whether it still exists", () => {
    renderView();
    expect(
      screen.getByRole("heading", { level: 2, name: "Push" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Plan A")).toBeInTheDocument();
    expect(
      screen.queryByText("No longer in the program"),
    ).not.toBeInTheDocument();

    cleanup();
    render(
      <SplitStatisticsView
        statistics={{ ...statistics, summary: history.splits[1]! }}
        localDate="2026-09-05"
      />,
    );
    expect(screen.getByText("No longer in the program")).toBeInTheDocument();
  });

  it("shows all six duration statistics and the exclusion rule", () => {
    const { container } = renderView();

    // The same duration also appears in the chart and the workout list, so
    // each statistic is read from its own tile.
    const tile = (label: string) => {
      const found = [
        ...container.querySelectorAll<HTMLElement>("[data-split-tile]"),
      ].find((element) => element.firstElementChild?.textContent === label);
      if (!found) throw new Error(`No tile for ${label}`);
      return within(found);
    };
    expect(tile("Completed").getByText("3")).toBeInTheDocument();
    expect(tile("Completed").getByText("workouts")).toBeInTheDocument();
    expect(tile("Average").getByText("1 h")).toBeInTheDocument();
    expect(tile("Shortest").getByText("50 min")).toBeInTheDocument();
    expect(tile("Longest").getByText("1 h 10 min")).toBeInTheDocument();
    expect(tile("Latest").getByText("1 h")).toBeInTheDocument();
    expect(tile("Latest").getByText("Sat 15 Aug")).toBeInTheDocument();
    expect(tile("Total").getByText("3 h")).toBeInTheDocument();
    expect(
      screen.getByText(/One-time workouts are excluded/),
    ).toBeInTheDocument();
  });

  it("summarises the series in words and lists every value", async () => {
    const user = userEvent.setup();
    renderView();

    // The prototype's `chartSummary` sentence replaces the Recharts summary
    // (PLAN.md step 11/12, ADR-0033).
    expect(
      screen.getByText(
        "2 workouts in range: 1 h 10 min to 1 h, best 1 h 10 min. Below where the range started.",
      ),
    ).toBeInTheDocument();
    // Each bar names its point, so the chart is not the only representation.
    expect(
      screen.getByRole("button", { name: "Sat 8 Aug · 1 h 10 min" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sat 15 Aug · 1 h" }),
    ).toHaveAttribute("aria-pressed", "true");

    const toggle = screen.getByRole("button", { name: "Chart values" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const values = screen.getByRole("list", { name: "Chart values" });
    const items = within(values).getAllByRole("listitem");
    // Newest first.
    expect(items[0]).toHaveTextContent("Sat 15 Aug1 h");
    expect(items[1]).toHaveTextContent("Sat 8 Aug1 h 10 min");
  });

  it("recomputes the series in place when the range changes", async () => {
    const user = userEvent.setup();
    renderView();
    const ranges = screen.getByRole("group", { name: "Time range" });
    expect(within(ranges).getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // A week back from 5 Sep holds neither workout.
    await user.click(within(ranges).getByRole("button", { name: "Week" }));
    expect(
      within(ranges).getByRole("button", { name: "Week" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText("No workout falls inside this range."),
    ).toBeInTheDocument();

    // A month back reaches 5 Aug and holds both again.
    await user.click(within(ranges).getByRole("button", { name: "Month" }));
    expect(
      screen.getByText(/^2 workouts in range: 1 h 10 min to 1 h/),
    ).toBeInTheDocument();

    // Changed by PLAN.md step 12: the chips no longer reload the series
    // through `getSplitStatisticsAction`.
    expect(actions.load).not.toHaveBeenCalled();
  });

  it("links each workout to its detail", () => {
    renderView();
    expect(
      screen.getByRole("link", { name: "Sat 15 Aug · 1 h" }),
    ).toHaveAttribute("href", `/history/workouts/${workoutId}`);
    expect(
      screen.getByRole("link", { name: "Sat 8 Aug · 1 h 10 min" }),
    ).toHaveAttribute("href", `/history/workouts/${olderWorkoutId}`);
  });
});
