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

vi.mock("@/app/actions/body", () => ({
  createTodayMeasurementEntriesAction: actions.createMeasurements,
}));

const programId = "11111111-1111-4111-8111-111111111111";
const proposedId = "22222222-2222-4222-8222-222222222222";
const alternateId = "33333333-3333-4333-8333-333333333333";
const exerciseAId = "44444444-4444-4444-8444-444444444444";
const exerciseBId = "55555555-5555-4555-8555-555555555555";

const noWeighIn = { localDate: "2026-08-26", entry: null } as const;
const recorded = {
  localDate: "2026-08-26",
  entry: {
    id: "77777777-7777-4777-8777-777777777777",
    entryDate: "2026-08-26",
    weightKg: 82.4,
  },
} as const;

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
    renderToday(
      <TodayExperience today={today} weight={noWeighIn} measurements={null} />,
    );

    expect(screen.getByText("Wed 26 Aug")).toBeVisible();
    expect(screen.getByText("Avg 1h 08m · 7 workouts")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Choose another split" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Choose Another Split" });
    await user.click(
      within(dialog).getAllByRole("button", {
        name: "Put on Today, don't start yet",
      })[1]!,
    );
    expect(screen.getByText("Today-only split")).toBeVisible();
    expect(screen.getByText("Upper Push")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Start Workout" }));
    expect(actions.startWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKind: "alternate_split",
        splitId: alternateId,
      }),
    );
    expect(actions.push).toHaveBeenCalledWith("/workout/current");
  });

  it("previews every exercise in the selected split beneath Start Workout", async () => {
    const user = userEvent.setup();
    renderToday(
      <TodayExperience today={today} weight={noWeighIn} measurements={null} />,
    );

    expect(screen.getByText("Back Squat")).toBeVisible();
    expect(screen.getByText("3 × 5–8")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Choose another split" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Choose Another Split" });
    await user.click(
      within(dialog).getAllByRole("button", {
        name: "Put on Today, don't start yet",
      })[1]!,
    );
    expect(screen.queryByText("Back Squat")).not.toBeInTheDocument();
    expect(screen.getByText("Overhead Press")).toBeVisible();
    expect(screen.getByText("4 × 6–10")).toBeVisible();
  });

  it("offers today's weight only while the day has none", async () => {
    const user = userEvent.setup();
    actions.createWeight.mockResolvedValue({ ok: true, value: recorded.entry });
    renderToday(
      <TodayExperience today={today} weight={noWeighIn} measurements={null} />,
    );

    const card = within(screen.getByRole("region", { name: "Today's weight" }));
    await user.click(card.getByRole("button", { name: "Add today's weight" }));
    const sheet = screen.getByRole("dialog", { name: "Add today's weight" });
    await user.type(within(sheet).getByLabelText("Weight (kg)"), "82.4");
    await user.click(
      within(sheet).getByRole("button", { name: "Save Weight" }),
    );

    expect(actions.createWeight).toHaveBeenCalledWith({
      entryDate: "2026-08-26",
      weightKg: 82.4,
    });
    expect(actions.refresh).toHaveBeenCalled();
  });

  it("shows the recorded weight instead of a second-entry prompt", () => {
    renderToday(
      <TodayExperience today={today} weight={recorded} measurements={null} />,
    );

    const card = within(screen.getByRole("region", { name: "Today's weight" }));
    expect(card.getByText("82.4 kg")).toBeVisible();
    expect(card.getByRole("link", { name: "See Weight" })).toHaveAttribute(
      "href",
      "/body/weight",
    );
    expect(
      card.queryByRole("button", { name: "Add today's weight" }),
    ).toBeNull();
  });

  it("resolves a weigh-in that appeared while the sheet was open", async () => {
    const user = userEvent.setup();
    actions.createWeight.mockResolvedValue({
      ok: false,
      error: {
        code: "validation",
        message: "Check the weigh-in and try again.",
        retryable: false,
        fieldErrors: { entryDate: ["That date already has a weigh-in."] },
      },
    });
    renderToday(
      <TodayExperience today={today} weight={noWeighIn} measurements={null} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Add today's weight" }),
    );
    const sheet = screen.getByRole("dialog", { name: "Add today's weight" });
    await user.type(within(sheet).getByLabelText("Weight (kg)"), "82.4");
    await user.click(
      within(sheet).getByRole("button", { name: "Save Weight" }),
    );

    expect(screen.getByText(/Today already has a weigh-in/)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Save Weight" })).toBeNull();
    expect(actions.refresh).toHaveBeenCalled();
  });

  it("keeps the weight card beside a restored workout and with no program", () => {
    renderToday(
      <TodayExperience
        today={{ ...today, proposedSplit: null, alternateSplits: [] }}
        weight={noWeighIn}
        measurements={null}
      />,
    );
    expect(
      screen.getByRole("region", { name: "Today's weight" }),
    ).toBeVisible();
    cleanup();

    renderToday(
      <TodayExperience
        today={{
          ...today,
          currentWorkout: {
            id: "66666666-6666-4666-8666-666666666666",
            name: "Lower Body",
            status: "active",
            accumulatedActiveSeconds: 60,
            activeSegmentStartedAt: null,
          },
        }}
        weight={noWeighIn}
        measurements={null}
      />,
    );
    expect(
      screen.getByRole("region", { name: "Today's weight" }),
    ).toBeVisible();
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
        weight={noWeighIn}
        measurements={null}
      />,
    );

    expect(screen.getByLabelText("Restored workout")).toHaveTextContent(
      "Paused · 24:18",
    );
    expect(screen.getByRole("link", { name: "Resume Workout" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Start Workout" }),
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

describe("MVP-TOD-005 today's measurements", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  const waist = { id: "m1", name: "Waist" };
  const arm = { id: "m2", name: "Left arm" };

  function measurements(
    entries: readonly { id: string; name: string; valueCm: number | null }[],
  ) {
    return { localDate: "2026-09-06", measurements: entries };
  }

  it("offers nothing when no measurement is defined", () => {
    renderToday(
      <TodayExperience
        today={today}
        weight={recorded}
        measurements={measurements([])}
      />,
    );

    expect(screen.queryByLabelText("Today's measurements")).toBeNull();
  });

  it("names what the day is missing and takes them in one save", async () => {
    const user = userEvent.setup();
    actions.createMeasurements.mockResolvedValue({ ok: true, value: [] });
    renderToday(
      <TodayExperience
        today={today}
        weight={recorded}
        measurements={measurements([
          { ...waist, valueCm: null },
          { ...arm, valueCm: null },
        ])}
      />,
    );

    const card = within(screen.getByLabelText("Today's measurements"));
    await user.click(
      card.getByRole("button", { name: "Add today's measurements" }),
    );

    const sheet = screen.getByRole("dialog", {
      name: "Add today's measurements",
    });
    await user.type(within(sheet).getByLabelText("Waist (cm)"), "84");
    await user.type(within(sheet).getByLabelText("Left arm (cm)"), "38");
    await user.click(
      within(sheet).getByRole("button", { name: "Save Measurements" }),
    );

    expect(actions.createMeasurements).toHaveBeenCalledWith([
      { measurementTypeId: "m1", entryDate: "2026-09-06", valueCm: 84 },
      { measurementTypeId: "m2", entryDate: "2026-09-06", valueCm: 38 },
    ]);
  });

  it("refuses a blank value against the measurement it belongs to", async () => {
    const user = userEvent.setup();
    renderToday(
      <TodayExperience
        today={today}
        weight={recorded}
        measurements={measurements([
          { ...waist, valueCm: null },
          { ...arm, valueCm: null },
        ])}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Add today's measurements" }),
    );
    const sheet = screen.getByRole("dialog", {
      name: "Add today's measurements",
    });
    await user.type(within(sheet).getByLabelText("Waist (cm)"), "84");
    await user.click(
      within(sheet).getByRole("button", { name: "Save Measurements" }),
    );

    expect(within(sheet).getByText("Enter a value.")).toBeVisible();
    expect(actions.createMeasurements).not.toHaveBeenCalled();
  });

  it("shows the day's values and no create control once none are missing", () => {
    renderToday(
      <TodayExperience
        today={today}
        weight={recorded}
        measurements={measurements([
          { ...waist, valueCm: 84 },
          { ...arm, valueCm: 38 },
        ])}
      />,
    );

    const card = within(screen.getByLabelText("Today's measurements"));
    expect(card.getByText("84 cm")).toBeVisible();
    expect(card.getByText("38 cm")).toBeVisible();
    expect(
      card.queryByRole("button", { name: "Add today's measurements" }),
    ).toBeNull();
    expect(card.getByRole("link", { name: "See Body" })).toBeVisible();
  });
});
