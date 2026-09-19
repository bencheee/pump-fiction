// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TodayView } from "@/features/active-workout/domain/workout";
import type { Exercise } from "@/features/exercises/domain/exercise";
import { ToastProvider } from "@/shared/ui";

import { OneTimeWorkoutForm } from "./one-time/one-time-workout-form";
import { TodayExperience } from "./today-experience";

const actions = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  setNext: vi.fn(),
  startWorkout: vi.fn(),
  createWeight: vi.fn(),
  createMeasurements: vi.fn(),
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
vi.mock("@/app/actions/weight", () => ({
  createWeightEntryAction: actions.createWeight,
}));

vi.mock("@/app/actions/body", () => ({}));

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

/** `MainShell` owns the one toast in the application; the tests stand in for it. */
function renderToday(ui: Parameters<typeof render>[0]) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("Today and workout-start mobile experience", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("starts the proposal and can place an alternate on Today without moving rotation", async () => {
    const user = userEvent.setup();
    actions.startWorkout.mockResolvedValue({ ok: true, value: {} });
    renderToday(<TodayExperience today={today} />);

    expect(screen.getByText("Wed 26 Aug")).toBeVisible();
    expect(screen.getByText("Avg 1h 08m · 7 workouts")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Another split" }));
    const dialog = screen.getByRole("dialog", { name: "Choose another split" });
    await user.click(
      within(dialog).getByRole("button", {
        name: "Put Upper Push on Today without starting it",
      }),
    );
    expect(screen.getByText("Today-only split")).toBeVisible();
    expect(screen.getByText("Upper Push")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Start today's workout" }),
    );
    expect(actions.startWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKind: "alternate_split",
        splitId: alternateId,
      }),
    );
    expect(actions.push).toHaveBeenCalledWith("/workout/current");
  });

  it("previews every exercise in the selected split", async () => {
    const user = userEvent.setup();
    renderToday(<TodayExperience today={today} />);

    expect(screen.getByText("Back Squat")).toBeVisible();
    expect(screen.getByText("3 × 5–8")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Another split" }));
    const dialog = screen.getByRole("dialog", { name: "Choose another split" });
    await user.click(
      within(dialog).getByRole("button", {
        name: "Put Upper Push on Today without starting it",
      }),
    );
    expect(screen.queryByText("Back Squat")).not.toBeInTheDocument();
    expect(screen.getByText("Overhead Press")).toBeVisible();
    expect(screen.getByText("4 × 6–10")).toBeVisible();
  });

  it("replaces all second-start actions with an accurate restore card", () => {
    renderToday(
      <TodayExperience
        today={{
          ...today,
          currentWorkout: {
            id: "66666666-6666-4666-8666-666666666666",
            name: "Lower Body",
            status: "paused",
            accumulatedActiveSeconds: 1458,
            activeSegmentStartedAt: null,
          },
        }}
      />,
    );

    expect(screen.getByLabelText("Restored workout")).toHaveTextContent(
      "Paused · 24:18",
    );
    expect(screen.getByRole("link", { name: "Resume workout" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Start today's workout" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "One-time workout" }),
    ).not.toBeInTheDocument();
  });

  it("keeps one-time input, validates, reorders, and submits active exercises", async () => {
    const user = userEvent.setup();
    actions.startWorkout.mockResolvedValueOnce({
      ok: false,
      error: { code: "persistence", message: "Try again.", retryable: true },
    });
    render(<OneTimeWorkoutForm exercises={exercises} />);

    await user.click(screen.getByRole("button", { name: "Start Workout" }));
    expect(
      screen.getAllByText("Enter a name for this workout."),
    ).not.toHaveLength(0);
    expect(
      screen.getAllByText("Add at least one exercise before starting."),
    ).not.toHaveLength(0);

    await user.type(screen.getByLabelText("Workout name"), "Hotel session");
    await user.click(screen.getByRole("button", { name: "Add Exercise" }));
    await user.click(screen.getByRole("button", { name: "Pull-Up" }));
    await user.click(screen.getByRole("button", { name: "Face Pull" }));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Move Face Pull up" }));
    await user.click(screen.getByRole("button", { name: "Start Workout" }));

    expect(actions.startWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKind: "one_time",
        name: "Hotel session",
        exerciseIds: [exerciseBId, exerciseAId],
      }),
    );
    expect(screen.getByText("Try again.")).toBeVisible();
    expect(screen.getByLabelText("Workout name")).toHaveValue("Hotel session");
  });
});
