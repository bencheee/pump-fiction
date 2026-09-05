// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Exercise } from "@/features/exercises/domain/exercise";
import type { Program, Split } from "@/features/programs/domain/program";
import { ToastProvider } from "@/shared/ui";

import { ProgramForm } from "./program-form";
import { SplitForm } from "./split-form";

const actions = vi.hoisted(() => ({
  activateProgram: vi.fn(),
  archiveProgram: vi.fn(),
  archiveSplit: vi.fn(),
  createProgram: vi.fn(),
  createSplit: vi.fn(),
  reorderExercises: vi.fn(),
  reorderSplits: vi.fn(),
  setNext: vi.fn(),
  updateProgram: vi.fn(),
  updateSplit: vi.fn(),
}));

vi.mock("@/app/actions/programs", () => ({
  activateProgramAction: actions.activateProgram,
  archiveProgramAction: actions.archiveProgram,
  archiveSplitAction: actions.archiveSplit,
  createProgramAction: actions.createProgram,
  createSplitAction: actions.createSplit,
  reorderSplitExercisesAction: actions.reorderExercises,
  reorderSplitsAction: actions.reorderSplits,
  setNextSplitAction: actions.setNext,
  updateProgramAction: actions.updateProgram,
  updateSplitAction: actions.updateSplit,
}));

const router = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));

function renderForm(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

const programId = "11111111-1111-4111-8111-111111111111";
const splitAId = "22222222-2222-4222-8222-222222222222";
const splitBId = "33333333-3333-4333-8333-333333333333";
const exerciseAId = "44444444-4444-4444-8444-444444444444";
const exerciseBId = "55555555-5555-4555-8555-555555555555";

const program: Program = {
  id: programId,
  name: "Strength",
  status: "active",
  nextSplitId: splitAId,
  splits: [
    { id: splitAId, programId, name: "Upper", position: 0, status: "active" },
    { id: splitBId, programId, name: "Lower", position: 1, status: "active" },
  ],
};

const split: Split = {
  ...program.splits[0]!,
  exercises: [
    {
      exerciseId: exerciseAId,
      exerciseName: "Press",
      exerciseStatus: "active",
      position: 0,
      plannedSets: 3,
      minReps: 8,
      maxReps: 12,
    },
    {
      exerciseId: exerciseBId,
      exerciseName: "Row",
      exerciseStatus: "active",
      position: 1,
      plannedSets: 3,
      minReps: 8,
      maxReps: 12,
    },
  ],
};

const exercises: Exercise[] = split.exercises.map((item) => ({
  id: item.exerciseId,
  name: item.exerciseName,
  baseType: "weights",
  allowedLoadModes: ["weight"],
  persistentNote: "",
  status: "active",
  splitUsageCount: 1,
}));

describe("Programs mobile forms", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("validates a draft name before creating it", async () => {
    const user = userEvent.setup();
    renderForm(<ProgramForm />);

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(screen.getByText("Enter a name for this program.")).toBeVisible();
    expect(actions.createProgram).not.toHaveBeenCalled();
  });

  it("saves split order without changing the current next split", async () => {
    const user = userEvent.setup();
    actions.reorderSplits.mockResolvedValue({
      ok: true,
      value: { ...program, splits: [...program.splits].reverse() },
    });
    renderForm(<ProgramForm program={program} />);

    await user.click(screen.getByRole("button", { name: "Move Upper down" }));

    expect(actions.reorderSplits).toHaveBeenCalledWith(programId, [
      splitBId,
      splitAId,
    ]);
    expect(screen.getByText("Order saved.")).toBeVisible();
    expect(
      within(screen.getByText("Upper").parentElement!).getByText("Next"),
    ).toBeVisible();
  });

  it("reports invalid rep ranges before saving a split", async () => {
    const user = userEvent.setup();
    renderForm(
      <SplitForm program={program} split={split} exerciseLibrary={exercises} />,
    );

    const maxReps = screen.getAllByLabelText("Max reps", {
      selector: "input",
    })[0]!;
    await user.clear(maxReps);
    await user.type(maxReps, "4");
    await user.click(screen.getByRole("button", { name: "Save Split" }));

    expect(
      screen.getByText("Maximum reps must be at least the minimum reps."),
    ).toBeVisible();
    expect(actions.updateSplit).not.toHaveBeenCalled();
  });

  it("reorders prescriptions and rejects archiving the last active split in the UI", async () => {
    const user = userEvent.setup();
    actions.reorderExercises.mockResolvedValue({ ok: true, value: split });
    renderForm(
      <SplitForm
        program={{ ...program, splits: [program.splits[0]!] }}
        split={split}
        exerciseLibrary={exercises}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Move Press down" }));

    expect(actions.reorderExercises).toHaveBeenCalledWith(splitAId, [
      exerciseBId,
      exerciseAId,
    ]);
    expect(screen.getByText("Order saved.")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Archive Split" }),
    ).toBeDisabled();
    expect(
      screen.getByText("At least one active split must remain in the program."),
    ).toBeVisible();
  });

  it("returns to the program list with a toast after saving a program", async () => {
    const user = userEvent.setup();
    actions.createProgram.mockResolvedValue({
      ok: true,
      value: { ...program, id: "created", name: "Hypertrophy" },
    });
    renderForm(<ProgramForm />);

    await user.type(screen.getByLabelText("Program name"), "Hypertrophy");
    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(router.replace).toHaveBeenCalledWith("/programs");
    expect(screen.getByText("Program saved.")).toBeVisible();
  });

  it("returns to its program with a toast after saving a split", async () => {
    const user = userEvent.setup();
    actions.updateSplit.mockResolvedValue({ ok: true, value: split });
    renderForm(
      <SplitForm program={program} split={split} exerciseLibrary={exercises} />,
    );

    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Split name"), " A");

    expect(screen.getByText("Unsaved changes")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Save Split" }));

    expect(router.replace).toHaveBeenCalledWith(`/programs/${programId}/edit`);
    expect(screen.getByText("Split saved.")).toBeVisible();
  });
});
