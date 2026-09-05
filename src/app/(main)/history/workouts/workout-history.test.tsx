// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
import { WorkoutDetail } from "./[id]/workout-detail";
import { WorkoutCorrectionForm } from "./[id]/edit/workout-correction-form";

const actions = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  correct: vi.fn(),
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
      exerciseIdentityId: "32000000-0000-4000-8000-000000000020",
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
          id: secondSetId,
          position: 2,
          loadMode: "weight",
          loadKg: null,
          bandDirection: null,
          bandStrength: null,
          reps: null,
        },
      ],
    },
  ],
};

const incomplete: HistoryWorkout = { ...completed, status: "incomplete" };

const summary: HistoryWorkoutSummary = {
  id: workoutId,
  workoutDate: "2026-08-09",
  name: "Push",
  programName: "Strength",
  sourceKind: "proposed_split",
  status: "incomplete",
  activeDurationSeconds: 3600,
  performedExerciseCount: 1,
};

beforeEach(() => {
  actions.correct.mockReset();
  actions.correct.mockResolvedValue({ ok: true, value: completed });
  actions.push.mockReset();
  actions.refresh.mockReset();
  actions.replace.mockReset();
  actions.toast.mockReset();
});
afterEach(cleanup);

describe("workout History detail", () => {
  it("renders the saved snapshot including a deleted definition", () => {
    render(<WorkoutDetail workout={completed} />);

    expect(screen.getByText(/Sun 9 Aug/)).toBeInTheDocument();
    expect(screen.getByText(/Strength/)).toBeInTheDocument();
    expect(screen.getByText("60 kg × 8")).toBeInTheDocument();
    expect(screen.getByText("No values")).toBeInTheDocument();
    expect(screen.getByText("No longer in the library")).toBeInTheDocument();
    expect(screen.getByText(/Felt strong/)).toBeInTheDocument();
    expect(screen.getByText("1 h")).toBeInTheDocument();
  });

  it("offers marking an incomplete workout completed and explains the exclusion", async () => {
    const user = userEvent.setup();
    render(<WorkoutDetail workout={incomplete} />);

    expect(
      screen.getByText(/does not feed personal records/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mark completed" }));

    expect(actions.correct).toHaveBeenCalledWith({
      kind: "mark_completed",
      workoutId,
    });
  });

  it("requires confirmation before deleting and returns to the list", async () => {
    const user = userEvent.setup();
    render(<WorkoutDetail workout={completed} />);

    await user.click(screen.getByRole("button", { name: "Delete workout" }));
    const dialog = screen.getByRole("alertdialog");
    expect(
      within(dialog).getByText(/Rotation is not affected/),
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Delete workout" }),
    );

    expect(actions.correct).toHaveBeenCalledWith({ kind: "delete", workoutId });
    expect(actions.push).toHaveBeenCalledWith("/history/workouts");
  });

  it("reports a failed correction without leaving the screen", async () => {
    const user = userEvent.setup();
    actions.correct.mockResolvedValue({
      ok: false,
      error: {
        code: "conflict",
        message: "That workout is still in progress.",
        retryable: false,
      },
    });
    render(<WorkoutDetail workout={incomplete} />);

    await user.click(screen.getByRole("button", { name: "Mark completed" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That workout is still in progress.",
    );
    expect(actions.push).not.toHaveBeenCalled();
  });
});

describe("workout History correction form", () => {
  it("reports unsaved changes only after the form differs", async () => {
    const user = userEvent.setup();
    render(<WorkoutCorrectionForm workout={completed} library={[]} />);

    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    const emptyReps = screen.getAllByLabelText("Reps")[1];
    if (!emptyReps) throw new Error("Expected a second set");
    await user.type(emptyReps, "6");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  it("sends only the values that changed and returns to the detail", async () => {
    const user = userEvent.setup();
    render(<WorkoutCorrectionForm workout={completed} library={[]} />);

    const repsFields = screen.getAllByLabelText("Reps");
    const secondReps = repsFields[1];
    if (!secondReps) throw new Error("Expected a second set");
    await user.type(secondReps, "6");
    await user.click(screen.getByRole("button", { name: "Save corrections" }));

    const sent = actions.correct.mock.calls.map(([correction]) => correction);
    expect(sent).toContainEqual(
      expect.objectContaining({ kind: "timing", workoutId }),
    );
    expect(sent).toContainEqual(
      expect.objectContaining({
        kind: "update_set",
        workoutSetId: secondSetId,
        reps: 6,
      }),
    );
    expect(sent).not.toContainEqual(
      expect.objectContaining({ workoutSetId: firstSetId }),
    );
    expect(actions.replace).toHaveBeenCalledWith(
      `/history/workouts/${workoutId}`,
    );
  });

  it("keeps the form open and reports a failure", async () => {
    const user = userEvent.setup();
    actions.correct.mockResolvedValue({
      ok: false,
      error: {
        code: "validation",
        message: "The finish time is before the start time.",
        retryable: false,
      },
    });
    render(<WorkoutCorrectionForm workout={completed} library={[]} />);

    await user.click(screen.getByRole("button", { name: "Save corrections" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "The finish time is before the start time.",
    );
    expect(actions.replace).not.toHaveBeenCalled();
  });

  it("confirms before removing a set that holds values", async () => {
    const user = userEvent.setup();
    render(<WorkoutCorrectionForm workout={completed} library={[]} />);

    await user.click(
      screen.getByRole("button", { name: "Remove set 1 of Bench press" }),
    );
    const dialog = screen.getByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Remove set" }),
    );

    expect(actions.correct).toHaveBeenCalledWith({
      kind: "remove_set",
      workoutSetId: firstSetId,
      confirmedPopulatedRemoval: true,
    });
  });

  it("removes an empty set without asking", async () => {
    const user = userEvent.setup();
    render(<WorkoutCorrectionForm workout={completed} library={[]} />);

    await user.click(
      screen.getByRole("button", { name: "Remove set 2 of Bench press" }),
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(actions.correct).toHaveBeenCalledWith({
      kind: "remove_set",
      workoutSetId: secondSetId,
      confirmedPopulatedRemoval: false,
    });
  });

  it("blocks structural changes while the form holds unsaved edits", async () => {
    const user = userEvent.setup();
    render(<WorkoutCorrectionForm workout={completed} library={[]} />);

    const secondReps = screen.getAllByLabelText("Reps")[1];
    if (!secondReps) throw new Error("Expected a second set");
    await user.type(secondReps, "6");

    expect(screen.getByRole("button", { name: "Add set" })).toBeDisabled();
    expect(
      screen.getByText(/Save your changes before adding/),
    ).toBeInTheDocument();
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
