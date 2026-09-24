// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  HistoryWorkout,
  HistoryWorkoutSummary,
} from "@/features/history/domain/workout-history";

import {
  formatHistoryDuration,
  formatHistoryMonth,
  summaryDetail,
} from "../history-presentation";
import { WorkoutCorrection } from "./[id]/edit/workout-correction";
import { WorkoutDetail } from "./[id]/workout-detail";

const actions = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  correct: vi.fn(),
  listExercises: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: actions.push,
    refresh: actions.refresh,
    replace: actions.replace,
  }),
}));
vi.mock("@/app/actions/workout-history", () => ({
  correctHistoryWorkoutAction: actions.correct,
}));
// The correction screen ends with the shared Add exercise picker.
vi.mock("@/app/actions/exercises", () => ({
  listExercisesAction: actions.listExercises,
}));
vi.mock("@/shared/ui/toast", async () => {
  const actual =
    await vi.importActual<typeof import("@/shared/ui/toast")>(
      "@/shared/ui/toast",
    );
  return { ...actual, useToast: () => ({ showToast: actions.toast }) };
});

const workoutId = "32000000-0000-4000-8000-000000000001";
const occurrenceId = "32000000-0000-4000-8000-000000000002";
const firstSetId = "32000000-0000-4000-8000-000000000003";
const secondSetId = "32000000-0000-4000-8000-000000000004";
const exerciseIdentityId = "32000000-0000-4000-8000-000000000020";

const completed: HistoryWorkout = {
  id: workoutId,
  status: "completed",
  sourceKind: "proposed_split",
  sourceProgramId: null,
  sourceSplitId: null,
  sourceProgramIdentityId: "32000000-0000-4000-8000-000000000010",
  sourceSplitIdentityId: "32000000-0000-4000-8000-000000000011",
  programName: "Strength",
  splitName: "Push",
  name: "Push",
  workoutDate: "2026-08-09",
  startedAt: "2026-08-09T09:00:00.000Z",
  finishedAt: "2026-08-09T10:00:00.000Z",
  activeDurationSeconds: 3600,
  exercises: [
    {
      id: occurrenceId,
      exerciseIdentityId,
      exerciseId: null,
      stillInLibrary: false,
      position: 1,
      exerciseName: "Bench press",
      exerciseBaseType: "weights",
      allowedLoadModes: ["weight"],
      persistentNote: "Brace hard",
      plannedSets: 2,
      minReps: 8,
      maxReps: 12,
      workoutNote: "Felt strong",
      sets: [
        {
          id: firstSetId,
          position: 1,
          loadMode: "weight",
          loadKg: 60,
          bandDirection: null,
          bandStrength: null,
          reps: 8,
        },
        {
          // A set that was never touched carries no mode, as the database
          // stores it; its fields come from the exercise definition.
          id: secondSetId,
          position: 2,
          loadMode: null,
          loadKg: null,
          bandDirection: null,
          bandStrength: null,
          reps: null,
        },
      ],
    },
  ],
};

const summary: HistoryWorkoutSummary = {
  id: workoutId,
  workoutDate: "2026-08-09",
  name: "Push",
  programName: "Strength",
  sourceKind: "proposed_split",
  status: "completed",
  activeDurationSeconds: 3600,
  performedExerciseCount: 1,
  volumeKgReps: 480,
};

beforeEach(() => {
  actions.correct.mockReset();
  actions.correct.mockResolvedValue({ ok: true, value: completed });
  actions.listExercises.mockReset();
  actions.listExercises.mockResolvedValue({ ok: true, value: [] });
  actions.push.mockReset();
  actions.refresh.mockReset();
  actions.replace.mockReset();
  actions.toast.mockReset();
});
afterEach(cleanup);

/**
 * The Actions panel is a two-step control (PLAN.md step 9): a press picks an
 * entry and `Continue` runs it.
 */
async function runAction(user: UserEvent, trigger: string, entry: string) {
  await user.click(screen.getByRole("button", { name: trigger }));
  const panel = await screen.findByRole("dialog", { name: "Actions" });
  await user.click(within(panel).getByRole("button", { name: entry }));
  await user.click(within(panel).getByRole("button", { name: "Continue" }));
}

describe("workout History detail", () => {
  const renderDetail = () =>
    render(<WorkoutDetail workout={completed} timeZone="UTC" />);

  it("renders the saved snapshot including a deleted definition", () => {
    const { container } = renderDetail();

    expect(screen.getByText("Sun 9 Aug · Strength")).toBeInTheDocument();
    const fact = (label: string) =>
      [
        ...container.querySelectorAll<HTMLElement>(
          "[data-workout-detail-fact]",
        ),
      ].find((element) => element.firstElementChild?.textContent === label)
        ?.lastElementChild?.textContent;
    expect(fact("Started")).toBe("Sun 9 Aug, 09:00");
    expect(fact("Finished")).toBe("10:00");
    expect(fact("Split")).toBe("Push");
    expect(fact("Program")).toBe("Strength");

    const stat = (label: string) =>
      [...container.querySelectorAll<HTMLElement>("[data-stat-card]")].find(
        (element) => element.firstElementChild?.textContent === label,
      )?.children[1]?.textContent;
    expect(stat("Active duration")).toBe("1 h");
    expect(stat("Performed")).toBe("1 exercise");

    const card = within(
      screen.getByRole("heading", { name: "Bench press" }).closest("section")!,
    );
    expect(
      card.getByText("Planned 2 × 8–12 · 1 set recorded"),
    ).toBeInTheDocument();
    expect(card.getByText("60 kg × 8")).toBeInTheDocument();
    expect(card.getByText("No values")).toBeInTheDocument();
    expect(card.getByText("No longer in the library")).toBeInTheDocument();
    expect(card.getByText("Exercise note: Brace hard")).toBeInTheDocument();
    expect(card.getByText("Workout note: Felt strong")).toBeInTheDocument();
    expect(
      card.getByRole("link", { name: "Exercise statistics for Bench press" }),
    ).toHaveAttribute("href", `/history/exercises/${exerciseIdentityId}`);
  });

  // A stored set that holds a mode but no load and no reps (the database
  // allows it) reads `No values` and is not counted as recorded (ADR-0027).
  it("treats a set with a mode but no values as unrecorded", () => {
    const [exercise] = completed.exercises;
    const [first, second] = exercise!.sets;
    render(
      <WorkoutDetail
        workout={{
          ...completed,
          exercises: [
            {
              ...exercise!,
              sets: [first!, { ...second!, loadMode: "weight" }],
            },
          ],
        }}
        timeZone="UTC"
      />,
    );
    expect(screen.getByText("No values")).toBeInTheDocument();
    expect(
      screen.getByText("Planned 2 × 8–12 · 1 set recorded"),
    ).toBeInTheDocument();
  });

  it("opens the correction screen from its actions", async () => {
    const user = userEvent.setup();
    renderDetail();

    await runAction(user, "Actions", "Edit workout");

    await waitFor(() =>
      expect(actions.push).toHaveBeenCalledWith(
        `/history/workouts/${workoutId}/edit`,
      ),
    );
    expect(actions.correct).not.toHaveBeenCalled();
  });

  it("requires confirmation before deleting and returns to the list", async () => {
    const user = userEvent.setup();
    renderDetail();

    await runAction(user, "Actions", "Delete workout");
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete this workout?",
    });
    expect(
      within(dialog).getByText(/Rotation is not affected/),
    ).toBeInTheDocument();
    expect(actions.correct).not.toHaveBeenCalled();
    await user.click(
      within(dialog).getByRole("button", { name: "Delete workout" }),
    );

    expect(actions.correct).toHaveBeenCalledWith({ kind: "delete", workoutId });
    await waitFor(() =>
      expect(actions.push).toHaveBeenCalledWith("/history/workouts"),
    );
    expect(actions.toast).toHaveBeenCalledWith(
      "Workout deleted. Affected statistics were recalculated.",
    );
  });

  it("keeps the workout when the deletion is cancelled", async () => {
    const user = userEvent.setup();
    renderDetail();

    await runAction(user, "Actions", "Delete workout");
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(actions.correct).not.toHaveBeenCalled();
    expect(actions.push).not.toHaveBeenCalled();
  });

  it("stays on the workout and reports a refused deletion", async () => {
    const user = userEvent.setup();
    actions.correct.mockResolvedValue({
      ok: false,
      error: { code: "unavailable", message: "Try again.", retryable: true },
    });
    renderDetail();

    await runAction(user, "Actions", "Delete workout");
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete workout" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Try again.");
    expect(actions.push).not.toHaveBeenCalled();
  });
});

describe("workout History correction", () => {
  const renderCorrection = () =>
    render(
      <WorkoutCorrection workout={completed} library={[]} timeZone="UTC" />,
    );
  const saveButton = () =>
    screen.getByRole("button", { name: "Save corrections" });

  /** Opens the Correct set panel for a set of Bench press. */
  async function openSet(user: UserEvent, position: number) {
    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Correct set ${position} of Bench press`),
      }),
    );
    return screen.findByRole("dialog", { name: "Correct set" });
  }

  it("reports unsaved changes only after the draft differs", async () => {
    const user = userEvent.setup();
    renderCorrection();

    // The Unsaved chip and the armed commit pill replace the old
    // `Unsaved changes` text (PLAN.md step 10).
    expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();
    expect(saveButton()).toHaveAttribute("data-armed", "false");

    await user.click(
      screen.getByRole("button", { name: "Start five minutes earlier" }),
    );
    expect(screen.getByText("Unsaved")).toBeInTheDocument();
    expect(saveButton()).toHaveAttribute("data-armed", "true");
    expect(screen.getByText("08:55")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Start five minutes later" }),
    );
    expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();
    expect(saveButton()).toHaveAttribute("data-armed", "false");
  });

  it("says there is nothing to correct when the draft is unchanged", async () => {
    const user = userEvent.setup();
    renderCorrection();

    await user.click(saveButton());

    expect(actions.toast).toHaveBeenCalledWith("Nothing to correct yet.");
    expect(actions.correct).not.toHaveBeenCalled();
    expect(actions.replace).not.toHaveBeenCalled();
  });

  it("sends only the values that changed and returns to the detail", async () => {
    const user = userEvent.setup();
    renderCorrection();

    const panel = await openSet(user, 2);
    expect(within(panel).getByText("Set 2 of 2")).toBeInTheDocument();
    expect(within(panel).getByText("Not recorded yet")).toBeInTheDocument();
    const reps = within(panel).getByRole("group", { name: "Reps" });
    await user.click(within(reps).getByRole("button", { name: "10" }));
    await user.click(
      within(panel).getByRole("button", { name: "Apply to set" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Correct set" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", {
        name: "Correct set 2 of Bench press, — kg × 10",
      }),
    ).toHaveAttribute("data-changed", "true");
    expect(
      screen.getByRole("button", {
        name: "Correct set 1 of Bench press, 60 kg × 8",
      }),
    ).toHaveAttribute("data-changed", "false");

    await user.click(saveButton());

    await waitFor(() =>
      expect(actions.replace).toHaveBeenCalledWith(
        `/history/workouts/${workoutId}`,
      ),
    );
    // Changed meaning (PLAN.md step 10): the draft sends a timing correction
    // only when a stepper moved, so an untouched time is not re-sent.
    expect(
      actions.correct.mock.calls.map(([correction]) => correction),
    ).toEqual([
      {
        kind: "update_set",
        workoutSetId: secondSetId,
        loadMode: "weight",
        loadKg: null,
        bandDirection: null,
        bandStrength: null,
        reps: 10,
      },
    ]);
    expect(actions.toast).toHaveBeenCalledWith(
      "Workout corrected. Affected statistics were recalculated.",
    );
  });

  it("corrects the timing through the steppers", async () => {
    const user = userEvent.setup();
    renderCorrection();

    await user.click(screen.getByRole("button", { name: "Previous day" }));
    await user.click(
      screen.getByRole("button", { name: "Start five minutes earlier" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Finish five minutes later" }),
    );
    expect(screen.getByText("Sat 8 Aug")).toBeInTheDocument();
    await user.click(saveButton());

    await waitFor(() => expect(actions.replace).toHaveBeenCalled());
    expect(actions.correct).toHaveBeenCalledTimes(1);
    expect(actions.correct).toHaveBeenCalledWith({
      kind: "timing",
      workoutId,
      workoutDate: "2026-08-08",
      startedAt: "2026-08-09T08:55:00.000Z",
      finishedAt: "2026-08-09T10:05:00.000Z",
    });
  });

  it("does not let the start and the finish cross", async () => {
    const user = userEvent.setup();
    render(
      <WorkoutCorrection
        workout={{
          ...completed,
          finishedAt: "2026-08-09T09:05:00.000Z",
        }}
        library={[]}
        timeZone="UTC"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Start five minutes later" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Start five minutes later" }),
    );
    // One step lands on the finish; the second would pass it.
    expect(screen.getAllByText("09:05")).toHaveLength(2);
    await user.click(
      screen.getByRole("button", { name: "Finish five minutes earlier" }),
    );
    expect(screen.getAllByText("09:05")).toHaveLength(2);
  });

  it("keeps the screen open and reports a failure", async () => {
    const user = userEvent.setup();
    actions.correct.mockResolvedValue({
      ok: false,
      error: {
        code: "validation",
        message: "The finish time is before the start time.",
        retryable: false,
      },
    });
    renderCorrection();

    await user.click(
      screen.getByRole("button", { name: "Finish five minutes later" }),
    );
    await user.click(saveButton());

    // The failure takes the shared alert card (PLAN.md step 10), which is an
    // `alert` rather than the old form's `status`.
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The finish time is before the start time.",
    );
    expect(actions.toast).toHaveBeenCalledWith(
      "The finish time is before the start time.",
    );
    expect(actions.replace).not.toHaveBeenCalled();
    expect(screen.getByText("Unsaved")).toBeInTheDocument();
  });

  it("confirms before removing a set that holds values", async () => {
    const user = userEvent.setup();
    renderCorrection();

    const panel = await openSet(user, 1);
    expect(within(panel).getByText("Recorded 60 kg × 8")).toBeInTheDocument();
    await user.click(
      within(panel).getByRole("button", { name: "Remove this set" }),
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Remove set 1 of Bench press?",
    });
    expect(actions.correct).not.toHaveBeenCalled();
    await user.click(
      within(dialog).getByRole("button", { name: "Remove set" }),
    );

    expect(actions.correct).toHaveBeenCalledWith({
      kind: "remove_set",
      workoutSetId: firstSetId,
      confirmedPopulatedRemoval: true,
    });
    await waitFor(() => expect(actions.refresh).toHaveBeenCalled());
    expect(actions.toast).toHaveBeenCalledWith(
      "Set removed. Affected statistics were recalculated.",
    );
  });

  it("removes an empty set without asking", async () => {
    const user = userEvent.setup();
    renderCorrection();

    const panel = await openSet(user, 2);
    await user.click(
      within(panel).getByRole("button", { name: "Remove this set" }),
    );

    await waitFor(() =>
      expect(actions.correct).toHaveBeenCalledWith({
        kind: "remove_set",
        workoutSetId: secondSetId,
        confirmedPopulatedRemoval: false,
      }),
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("offers a load for a set that was never given values", async () => {
    const user = userEvent.setup();
    renderCorrection();

    // The second set has no stored values. Its wheels come from the exercise
    // definition, so it can still be completed afterwards.
    const panel = await openSet(user, 2);
    const load = within(panel).getByRole("group", { name: "Load" });
    expect(load).toHaveTextContent("—kg");
    await user.click(within(load).getByRole("button", { name: "5" }));
    const reps = within(panel).getByRole("group", { name: "Reps" });
    await user.click(within(reps).getByRole("button", { name: "10" }));
    await user.click(within(reps).getByRole("button", { name: "8" }));
    await user.click(
      within(panel).getByRole("button", { name: "Apply to set" }),
    );
    await user.click(saveButton());

    await waitFor(() =>
      expect(actions.correct).toHaveBeenCalledWith({
        kind: "update_set",
        workoutSetId: secondSetId,
        loadMode: "weight",
        loadKg: 5,
        bandDirection: null,
        bandStrength: null,
        reps: 8,
      }),
    );
  });

  it("runs a structural correction from the exercise's actions", async () => {
    const user = userEvent.setup();
    renderCorrection();

    await runAction(
      user,
      "Actions for Bench press",
      "Add a set to this exercise",
    );

    await waitFor(() =>
      expect(actions.correct).toHaveBeenCalledWith({
        kind: "add_set",
        workoutExerciseId: occurrenceId,
      }),
    );
    await waitFor(() => expect(actions.refresh).toHaveBeenCalled());
  });

  it("confirms before removing an exercise that holds values", async () => {
    const user = userEvent.setup();
    renderCorrection();

    await runAction(user, "Actions for Bench press", "Remove this exercise");
    const dialog = await screen.findByRole("alertdialog", {
      name: "Remove Bench press from this workout?",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Remove exercise" }),
    );

    expect(actions.correct).toHaveBeenCalledWith({
      kind: "remove_exercise",
      workoutExerciseId: occurrenceId,
      confirmedPopulatedRemoval: true,
    });
  });

  it("blocks structural changes while the draft holds unsaved edits", async () => {
    const user = userEvent.setup();
    renderCorrection();

    expect(screen.queryByText(/Save or discard first/)).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Finish five minutes later" }),
    );

    expect(
      screen.getByText("Save or discard first to add, remove or reorder."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add exercise" })).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Actions for Bench press" }),
    );
    const actionsPanel = await screen.findByRole("dialog", { name: "Actions" });
    for (const entry of [
      "Add a set to this exercise",
      "Move up",
      "Move down",
      "Remove this exercise",
    ])
      expect(
        within(actionsPanel).getByRole("button", { name: entry }),
      ).toBeDisabled();
    // The note is part of the draft, so it stays available.
    expect(
      within(actionsPanel).getByRole("button", { name: "Edit workout note" }),
    ).toBeEnabled();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Actions" }),
      ).not.toBeInTheDocument(),
    );

    const panel = await openSet(user, 1);
    expect(
      within(panel).getByRole("button", { name: "Remove this set" }),
    ).toBeDisabled();
    expect(actions.correct).not.toHaveBeenCalled();
  });

  it("leads back to the detail without saving", () => {
    renderCorrection();
    expect(
      screen.getByRole("link", { name: "Discard changes" }),
    ).toHaveAttribute("href", `/history/workouts/${workoutId}`);
  });
});

describe("workout History presentation", () => {
  it("names the month group and summarises a list row", () => {
    expect(formatHistoryMonth("2026-08")).toBe("August 2026");
    expect(summaryDetail(summary)).toBe("Sun 9 Aug · 1 h · 1 exercise");
  });

  it("keeps a duration under an hour in minutes", () => {
    expect(formatHistoryDuration(1_800)).toBe("30 min");
    expect(formatHistoryDuration(5_400)).toBe("1 h 30 min");
  });
});
