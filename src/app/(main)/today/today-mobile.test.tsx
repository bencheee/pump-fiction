// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TodayView } from "@/features/active-workout/domain/workout";
import type { Exercise } from "@/features/exercises/domain/exercise";

import { TodayExperience } from "./today-experience";

// ADR-0032 withdrew MVP-TOD-004 and MVP-TOD-005: Today no longer carries the
// weight or measurement card, so neither their actions nor the toast that
// `MainShell` owns for them are part of this screen any more.
const actions = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  setNext: vi.fn(),
  startWorkout: vi.fn(),
  listExercises: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: actions.push, refresh: actions.refresh }),
}));
vi.mock("@/app/actions/programs", () => ({
  setNextSplitAction: actions.setNext,
}));
vi.mock("@/app/actions/workouts", () => ({
  startWorkoutAction: actions.startWorkout,
}));
vi.mock("@/app/actions/exercises", () => ({
  listExercisesAction: actions.listExercises,
}));

const programId = "11111111-1111-4111-8111-111111111111";
const proposedId = "22222222-2222-4222-8222-222222222222";
const alternateId = "33333333-3333-4333-8333-333333333333";
const exerciseAId = "44444444-4444-4444-8444-444444444444";
const exerciseBId = "55555555-5555-4555-8555-555555555555";

const today: TodayView = {
  localDate: "2026-08-26",
  proposedSplit: {
    programId,
    programName: "Strength",
    splitId: proposedId,
    splitName: "Lower Body",
    position: 0,
    averageDurationSeconds: 4080,
    completedWorkoutCount: 7,
    exercises: [
      {
        exerciseId: exerciseAId,
        exerciseName: "Back Squat",
        position: 1,
        plannedSets: 3,
        minReps: 5,
        maxReps: 8,
      },
    ],
  },
  alternateSplits: [
    {
      programId,
      programName: "Strength",
      splitId: alternateId,
      splitName: "Upper Push",
      position: 1,
      averageDurationSeconds: null,
      completedWorkoutCount: 0,
      exercises: [
        {
          exerciseId: exerciseBId,
          exerciseName: "Overhead Press",
          position: 1,
          plannedSets: 4,
          minReps: 6,
          maxReps: 10,
        },
      ],
    },
  ],
  currentWorkout: null,
};

const exercises: Exercise[] = [
  {
    id: exerciseAId,
    name: "Pull-Up",
    baseType: "bodyweight",
    allowedLoadModes: ["bodyweight", "bodyweight_added_weight"],
    persistentNote: "",
    splitUsageCount: 0,
  },
  {
    id: exerciseBId,
    name: "Face Pull",
    baseType: "bodyweight",
    allowedLoadModes: ["bodyweight", "bodyweight_resistance_band"],
    persistentNote: "",
    splitUsageCount: 0,
  },
];

const restoredWorkout = {
  id: "66666666-6666-4666-8666-666666666666",
  name: "Lower Body",
  status: "paused",
  accumulatedActiveSeconds: 1458,
  activeSegmentStartedAt: null,
} as const;

function renderToday(view: TodayView = today) {
  return render(<TodayExperience today={view} serverNow={Date.now()} />);
}

async function openChooseSplit(user: ReturnType<typeof userEvent.setup>) {
  // Step 3 of the redesign plan: prototype copy, `Another split` opens the
  // `Choose another split` panel.
  await user.click(screen.getByRole("button", { name: "Another split" }));
  return screen.getByRole("dialog", { name: "Choose another split" });
}

describe("Today and workout-start mobile experience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "");
  });
  afterEach(cleanup);

  it("starts the proposal on the overview", async () => {
    const user = userEvent.setup();
    actions.startWorkout.mockResolvedValue({ ok: true, value: {} });
    renderToday();

    expect(screen.getByText("Wed 26 Aug")).toBeVisible();
    expect(screen.getByText("Next in your program")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Lower Body" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Avg 1h 08m · 7 workouts")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Start today's workout" }),
    );
    expect(actions.startWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKind: "proposed_split",
        splitId: proposedId,
      }),
    );
    // Starts land on the prototype's overview (redesign plan, step 5).
    expect(actions.push).toHaveBeenCalledWith("/workout/current?view=overview");
  });

  it("can place an alternate on Today without moving rotation", async () => {
    const user = userEvent.setup();
    actions.startWorkout.mockResolvedValue({ ok: true, value: {} });
    renderToday();

    const dialog = await openChooseSplit(user);
    // Sorted by the program's own order, the split on Today tinted.
    const cards = within(dialog).getAllByRole("region");
    expect(cards.map((card) => card.getAttribute("aria-label"))).toEqual([
      "Lower Body",
      "Upper Push",
    ]);
    expect(cards[0]).toHaveAttribute("data-split-card", "current");
    expect(cards[1]).toHaveAttribute("data-split-card", "");
    expect(
      within(cards[0]!).getByText("Avg 1h 08m · 7 workouts"),
    ).toBeVisible();

    await user.click(
      within(cards[1]!).getByRole("button", {
        name: "Put on Today, don't start yet",
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Choose another split" }),
      ).not.toBeInTheDocument(),
    );
    expect(actions.startWorkout).not.toHaveBeenCalled();
    expect(screen.getByText("Today-only split")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Upper Push" })).toBeVisible();
    // The rotation still names the proposal, and nothing set a new next split.
    expect(screen.getByText(/Rotation position: Lower Body\./)).toBeVisible();
    expect(actions.setNext).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Start today's workout" }),
    );
    expect(actions.startWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKind: "alternate_split",
        splitId: alternateId,
      }),
    );
    expect(actions.push).toHaveBeenCalledWith("/workout/current?view=overview");
  });

  it("starts an alternate straight from the panel with Train today", async () => {
    const user = userEvent.setup();
    actions.startWorkout.mockResolvedValue({ ok: true, value: {} });
    renderToday();

    const dialog = await openChooseSplit(user);
    const upperPush = within(dialog).getByRole("region", {
      name: "Upper Push",
    });
    const train = within(upperPush).getByRole("button", {
      name: "Train this today",
    });
    expect(train).toHaveTextContent("Train today");
    await user.click(train);

    expect(actions.startWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKind: "alternate_split",
        splitId: alternateId,
      }),
    );
    expect(actions.setNext).not.toHaveBeenCalled();
    expect(actions.push).toHaveBeenCalledWith("/workout/current?view=overview");
  });

  it("previews every exercise in the selected split beneath the start action", async () => {
    const user = userEvent.setup();
    renderToday();

    expect(screen.getByText("Back Squat")).toBeVisible();
    // Step 2: the scheme is the prototype's `3 × 5–8`, with no `reps` unit.
    expect(screen.getByText("3 × 5–8")).toBeVisible();

    const dialog = await openChooseSplit(user);
    await user.click(
      within(
        within(dialog).getByRole("region", { name: "Upper Push" }),
      ).getByRole("button", { name: "Put on Today, don't start yet" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.queryByText("Back Squat")).not.toBeInTheDocument();
    expect(screen.getByText("Overhead Press")).toBeVisible();
    expect(screen.getByText("4 × 6–10")).toBeVisible();
  });

  it("offers no split panel when the program has only one split", () => {
    renderToday({ ...today, alternateSplits: [] });

    expect(
      screen.queryByRole("button", { name: "Another split" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "One-time workout" }),
    ).toBeVisible();
  });

  it("keeps a one-time workout available when there is no program", () => {
    renderToday({ ...today, proposedSplit: null, alternateSplits: [] });

    expect(screen.getByText("No proposed workout")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Go to Programs" }),
    ).toHaveAttribute("href", "/programs");
    expect(
      screen.queryByRole("button", { name: "Start today's workout" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "One-time workout" }),
    ).toBeVisible();
  });

  it("raises a refused start on Today and retries the same definition", async () => {
    const user = userEvent.setup();
    actions.startWorkout
      .mockResolvedValueOnce({
        ok: false,
        error: { code: "persistence", message: "Try again.", retryable: true },
      })
      .mockResolvedValueOnce({ ok: true, value: {} });
    renderToday();

    await user.click(
      screen.getByRole("button", { name: "Start today's workout" }),
    );
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Try again.");
    expect(actions.push).not.toHaveBeenCalled();

    const [firstDefinition] = actions.startWorkout.mock.calls[0]!;
    await user.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(actions.startWorkout).toHaveBeenCalledTimes(2);
    expect(actions.startWorkout.mock.calls[1]![0]).toEqual(firstDefinition);
    expect(actions.push).toHaveBeenCalledWith("/workout/current?view=overview");
  });

  it("offers no retry for a start the server will not accept", async () => {
    const user = userEvent.setup();
    actions.startWorkout.mockResolvedValueOnce({
      ok: false,
      error: {
        code: "conflict",
        message: "A workout is already in progress.",
        retryable: false,
      },
    });
    renderToday();

    await user.click(
      screen.getByRole("button", { name: "Start today's workout" }),
    );
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("A workout is already in progress.");
    expect(
      within(alert).queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });

  it("replaces all second-start actions with an accurate restore card", () => {
    renderToday({ ...today, currentWorkout: restoredWorkout });

    const card = screen.getByRole("region", { name: "Restored workout" });
    expect(card).toHaveTextContent("Lower Body");
    expect(card).toHaveTextContent("Paused · 24:18");
    expect(
      within(card).getByRole("link", { name: "Resume workout" }),
    ).toHaveAttribute("href", "/workout/current");
    expect(
      screen.getByText(
        "Finish or discard the restored workout before starting another.",
      ),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Start today's workout" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Another split" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "One-time workout" }),
    ).not.toBeInTheDocument();
  });

  it("offers the restore card even with no program", () => {
    renderToday({
      ...today,
      proposedSplit: null,
      alternateSplits: [],
      currentWorkout: { ...restoredWorkout, status: "active" },
    });

    expect(
      screen.getByRole("region", { name: "Restored workout" }),
    ).toHaveTextContent("Running · 24:18");
    expect(
      screen.queryByRole("button", { name: "One-time workout" }),
    ).not.toBeInTheDocument();
  });
});

// MVP-TOD-003, as the Owner decided after step 21 of the redesign plan: the
// one-time workout opens the shared Add exercise panel instead of the deleted
// `/today/one-time` form. Its name is always `One-time workout`, so the old
// name field, its validation and the reorder buttons have no surface left; the
// exercises start in the order they were picked.
describe("MVP-TOD-003 one-time workout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "");
    actions.listExercises.mockResolvedValue({ ok: true, value: exercises });
  });
  afterEach(cleanup);

  async function openOneTime(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "One-time workout" }));
    const panel = screen.getByRole("dialog", { name: "Add exercise" });
    await within(panel).findByRole("button", { name: "Pull-Up" });
    return panel;
  }

  it("starts `One-time workout` with the exercises the panel adds", async () => {
    const user = userEvent.setup();
    actions.startWorkout.mockResolvedValue({ ok: true, value: {} });
    renderToday();

    const panel = await openOneTime(user);
    expect(actions.listExercises).toHaveBeenCalledTimes(1);
    const add = within(panel).getByRole("button", { name: "Add selected" });
    // Nothing picked, nothing to start with: the workout needs an exercise.
    expect(add).toBeDisabled();
    expect(add).toHaveTextContent("Select exercises");

    await user.click(within(panel).getByRole("button", { name: "Face Pull" }));
    await user.click(within(panel).getByRole("button", { name: "Pull-Up" }));
    expect(add).toHaveTextContent("Add 2 selected");
    await user.click(add);

    expect(actions.startWorkout).toHaveBeenCalledTimes(1);
    expect(actions.startWorkout).toHaveBeenCalledWith({
      sourceKind: "one_time",
      name: "One-time workout",
      exerciseIds: [exerciseAId, exerciseBId],
      startedAt: expect.any(String),
    });
    const { startedAt } = actions.startWorkout.mock.calls[0]![0] as {
      startedAt: string;
    };
    expect(Number.isNaN(Date.parse(startedAt))).toBe(false);
    expect(actions.push).toHaveBeenCalledWith("/workout/current?view=overview");
  });

  it("searches the active library before adding", async () => {
    const user = userEvent.setup();
    actions.startWorkout.mockResolvedValue({ ok: true, value: {} });
    renderToday();

    const panel = await openOneTime(user);
    await user.type(
      within(panel).getByRole("searchbox", { name: "Search active library" }),
      "face",
    );
    expect(
      within(panel).queryByRole("button", { name: "Pull-Up" }),
    ).not.toBeInTheDocument();
    await user.click(within(panel).getByRole("button", { name: "Face Pull" }));
    await user.click(
      within(panel).getByRole("button", { name: "Add selected" }),
    );

    expect(actions.startWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKind: "one_time",
        exerciseIds: [exerciseBId],
      }),
    );
  });

  it("starts nothing when the panel is closed", async () => {
    const user = userEvent.setup();
    renderToday();

    const panel = await openOneTime(user);
    await user.click(within(panel).getByRole("button", { name: "Pull-Up" }));
    await user.click(within(panel).getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Add exercise" }),
      ).not.toBeInTheDocument(),
    );
    expect(actions.startWorkout).not.toHaveBeenCalled();
    expect(actions.push).not.toHaveBeenCalled();
  });

  it("raises a refused one-time start on Today and retries it", async () => {
    const user = userEvent.setup();
    actions.startWorkout
      .mockResolvedValueOnce({
        ok: false,
        error: { code: "persistence", message: "Try again.", retryable: true },
      })
      .mockResolvedValueOnce({ ok: true, value: {} });
    renderToday();

    const panel = await openOneTime(user);
    await user.click(within(panel).getByRole("button", { name: "Pull-Up" }));
    await user.click(
      within(panel).getByRole("button", { name: "Add selected" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Try again.");
    expect(actions.push).not.toHaveBeenCalled();

    await user.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(actions.startWorkout).toHaveBeenCalledTimes(2);
    expect(actions.startWorkout.mock.calls[1]![0]).toEqual(
      actions.startWorkout.mock.calls[0]![0],
    );
    expect(actions.startWorkout.mock.calls[1]![0]).toMatchObject({
      sourceKind: "one_time",
      name: "One-time workout",
      exerciseIds: [exerciseAId],
    });
    expect(actions.push).toHaveBeenCalledWith("/workout/current?view=overview");
  });

  it("names a library that failed to load and loads it again on Retry", async () => {
    const user = userEvent.setup();
    actions.listExercises
      .mockResolvedValueOnce({
        ok: false,
        error: {
          code: "persistence",
          message: "Could not load exercises.",
          retryable: true,
        },
      })
      .mockResolvedValueOnce({ ok: true, value: exercises });
    renderToday();

    await user.click(screen.getByRole("button", { name: "One-time workout" }));
    const panel = screen.getByRole("dialog", { name: "Add exercise" });
    const alert = await within(panel).findByRole("alert");
    expect(alert).toHaveTextContent("Could not load exercises.");
    expect(
      within(panel).getByRole("button", { name: "Add selected" }),
    ).toBeDisabled();

    await user.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(
      await within(panel).findByRole("button", { name: "Pull-Up" }),
    ).toBeVisible();
    expect(actions.startWorkout).not.toHaveBeenCalled();
  });
});
