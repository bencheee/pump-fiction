// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Exercise } from "@/features/exercises/domain/exercise";
import type { Program, Split } from "@/features/programs/domain/program";
import { ToastProvider } from "@/shared/ui";

import { ProgramForm } from "./program-form";
import { SplitForm } from "./split-form";

const actions = vi.hoisted(() => ({
  setCurrentProgram: vi.fn(),
  deleteProgram: vi.fn(),
  deleteSplit: vi.fn(),
  createProgram: vi.fn(),
  createSplit: vi.fn(),
  reorderExercises: vi.fn(),
  reorderSplits: vi.fn(),
  setNext: vi.fn(),
  updateProgram: vi.fn(),
  updateSplit: vi.fn(),
}));

vi.mock("@/app/actions/programs", () => ({
  setCurrentProgramAction: actions.setCurrentProgram,
  deleteProgramAction: actions.deleteProgram,
  deleteSplitAction: actions.deleteSplit,
  createProgramAction: actions.createProgram,
  createSplitAction: actions.createSplit,
  reorderSplitExercisesAction: actions.reorderExercises,
  reorderSplitsAction: actions.reorderSplits,
  setNextSplitAction: actions.setNext,
  updateProgramAction: actions.updateProgram,
  updateSplitAction: actions.updateSplit,
}));

const router = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => router }));

type User = ReturnType<typeof userEvent.setup>;

function renderForm(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

/** The toast the screen raised; the prototype keeps one at a time. */
async function findToast(message: string) {
  const toast = await screen.findByRole("status");
  await waitFor(() => expect(toast).toHaveTextContent(message));
  return toast;
}

async function openActions(user: User) {
  await user.click(screen.getByRole("button", { name: "Actions" }));
  return screen.findByRole("dialog", { name: "Actions" });
}

/** Picks an entry of the Actions panel and presses Continue, as the panel asks. */
async function runAction(user: User, label: string) {
  const panel = await openActions(user);
  await user.click(within(panel).getByRole("button", { name: label }));
  await user.click(within(panel).getByRole("button", { name: "Continue" }));
}

function entryLabels(panel: HTMLElement) {
  return within(panel)
    .getAllByRole("button")
    .filter((button) => button.hasAttribute("data-actions-item"))
    .map((button) => button.getAttribute("aria-label"));
}

/** The value a prescription well shows, read beside its plus button. */
function wellValue(upLabel: string) {
  return screen.getByRole("button", { name: upLabel }).previousElementSibling
    ?.textContent;
}

const programId = "11111111-1111-4111-8111-111111111111";
const splitAId = "22222222-2222-4222-8222-222222222222";
const splitBId = "33333333-3333-4333-8333-333333333333";
const exerciseAId = "44444444-4444-4444-8444-444444444444";
const exerciseBId = "55555555-5555-4555-8555-555555555555";
const exerciseCId = "66666666-6666-4666-8666-666666666666";
const exerciseDId = "77777777-7777-4777-8777-777777777777";

const program: Program = {
  id: programId,
  name: "Strength",
  isCurrent: true,
  nextSplitId: splitAId,
  splits: [
    { id: splitAId, programId, name: "Upper", position: 0, exerciseCount: 2 },
    { id: splitBId, programId, name: "Lower", position: 1, exerciseCount: 1 },
  ],
};

const split: Split = {
  ...program.splits[0]!,
  exercises: [
    {
      exerciseId: exerciseAId,
      exerciseName: "Press",
      position: 0,
      plannedSets: 3,
      minReps: 8,
      maxReps: 12,
    },
    {
      exerciseId: exerciseBId,
      exerciseName: "Row",
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
  splitUsageCount: 1,
}));

const library: Exercise[] = [
  ...exercises,
  {
    id: exerciseCId,
    name: "Curl",
    baseType: "weights",
    measurementType: "reps",
    allowedLoadModes: ["weight"],
    persistentNote: "",
    splitUsageCount: 0,
  },
  {
    id: exerciseDId,
    name: "Plank",
    baseType: "bodyweight",
    measurementType: "seconds",
    allowedLoadModes: ["bodyweight"],
    persistentNote: "",
    splitUsageCount: 0,
  },
];

function splitRow(name: string) {
  return screen.getByRole("link", { name: new RegExp(`^${name}, position`) });
}

function prescriptionCard(name: string) {
  return screen.getByRole("region", { name: new RegExp(`^${name}, position`) });
}

describe("Programs mobile forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "");
  });
  afterEach(cleanup);

  describe("ProgramForm", () => {
    it("validates a program name before creating it", async () => {
      const user = userEvent.setup();
      renderForm(<ProgramForm />);

      await runAction(user, "Save program");

      await findToast("Enter a program name.");
      expect(screen.getByLabelText("Program name")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(actions.createProgram).not.toHaveBeenCalled();
    });

    it("marks a new program Unsaved from the first frame and offers only Save", async () => {
      const user = userEvent.setup();
      renderForm(<ProgramForm />);

      expect(screen.getByText("Unsaved")).toBeVisible();
      expect(
        screen.getByText("Save the program first, then add its splits."),
      ).toBeVisible();
      expect(
        screen.queryByRole("link", { name: "Add split" }),
      ).not.toBeInTheDocument();

      const panel = await openActions(user);
      expect(entryLabels(panel)).toEqual(["Save program"]);
      expect(
        within(panel).getByRole("button", { name: "Continue" }),
      ).toBeDisabled();
    });

    it("raises Unsaved only while the name differs from the saved one", async () => {
      const user = userEvent.setup();
      renderForm(<ProgramForm program={program} />);

      expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();
      const nameField = screen.getByLabelText("Program name");
      await user.type(nameField, "!");
      expect(screen.getByText("Unsaved")).toBeVisible();
      await user.type(nameField, "{Backspace}");
      expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();

      const panel = await openActions(user);
      expect(entryLabels(panel)).toEqual([
        "Save changes",
        "Set next split",
        "Delete program",
      ]);
    });

    it("returns to the program list with a toast after saving a program", async () => {
      const user = userEvent.setup();
      actions.createProgram.mockResolvedValue({
        ok: true,
        value: { ...program, id: "created", name: "Hypertrophy" },
      });
      renderForm(<ProgramForm />);

      await user.type(screen.getByLabelText("Program name"), "Hypertrophy");
      await runAction(user, "Save program");

      await findToast("Program saved.");
      expect(actions.createProgram).toHaveBeenCalledWith({
        name: "Hypertrophy",
      });
      expect(router.replace).toHaveBeenCalledWith("/programs");
    });

    it("saves a renamed program through Save changes", async () => {
      const user = userEvent.setup();
      actions.updateProgram.mockResolvedValue({
        ok: true,
        value: { ...program, name: "Power" },
      });
      renderForm(<ProgramForm program={program} />);

      const nameField = screen.getByLabelText("Program name");
      await user.clear(nameField);
      await user.type(nameField, "Power");
      await runAction(user, "Save changes");

      await findToast("Program saved.");
      expect(actions.updateProgram).toHaveBeenCalledWith(programId, {
        name: "Power",
      });
      expect(router.replace).toHaveBeenCalledWith("/programs");
    });

    it("lists each split as a link to its editor with its position and exercise count", async () => {
      const user = userEvent.setup();
      renderForm(<ProgramForm program={program} />);

      const upper = splitRow("Upper");
      expect(upper).toHaveAccessibleName("Upper, position 1 of 2");
      expect(upper).toHaveAttribute("href", `/splits/${splitAId}/edit`);
      expect(within(upper).getByText("Position 1 · 2 exercises")).toBeVisible();
      expect(within(upper).getByText("Next")).toBeVisible();
      const lower = splitRow("Lower");
      expect(within(lower).getByText("Position 2 · 1 exercise")).toBeVisible();
      expect(within(lower).queryByText("Next")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Add split" })).toHaveAttribute(
        "href",
        `/programs/${programId}/splits/new`,
      );

      await user.click(lower);
      expect(router.push).toHaveBeenCalledWith(`/splits/${splitBId}/edit`);
    });

    it("saves split order at once without changing the current next split", async () => {
      const user = userEvent.setup();
      actions.reorderSplits.mockResolvedValue({
        ok: true,
        value: { ...program, splits: [...program.splits].reverse() },
      });
      renderForm(<ProgramForm program={program} />);

      splitRow("Upper").focus();
      await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

      expect(actions.reorderSplits).toHaveBeenCalledWith(programId, [
        splitBId,
        splitAId,
      ]);
      await findToast("Order saved.");
      const upper = splitRow("Upper");
      expect(upper).toHaveAccessibleName("Upper, position 2 of 2");
      expect(within(upper).getByText("Next")).toBeVisible();
      expect(
        within(splitRow("Lower")).queryByText("Next"),
      ).not.toBeInTheDocument();
    });

    it("moves a split up with Alt and ArrowUp and not past the ends", async () => {
      const user = userEvent.setup();
      actions.reorderSplits.mockResolvedValue({
        ok: true,
        value: { ...program, splits: [...program.splits].reverse() },
      });
      renderForm(<ProgramForm program={program} />);

      splitRow("Upper").focus();
      await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
      splitRow("Lower").focus();
      await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
      // An arrow without Alt is the page's, not the row's.
      await user.keyboard("{ArrowUp}");
      expect(actions.reorderSplits).not.toHaveBeenCalled();

      await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
      expect(actions.reorderSplits).toHaveBeenCalledWith(programId, [
        splitBId,
        splitAId,
      ]);
      await findToast("Order saved.");
    });

    it("moves a split by holding and dragging it, and a press just after does not open it", async () => {
      actions.reorderSplits.mockResolvedValue({
        ok: true,
        value: { ...program, splits: [...program.splits].reverse() },
      });
      renderForm(<ProgramForm program={program} />);

      const upper = splitRow("Upper");
      fireEvent.pointerDown(upper, { pointerId: 1, clientY: 100 });
      await act(() => new Promise((resolve) => setTimeout(resolve, 220)));
      expect(upper).toHaveAttribute("data-drag", "lifted");
      fireEvent.pointerMove(upper, { pointerId: 1, clientY: 190 });
      fireEvent.pointerUp(upper, { pointerId: 1, clientY: 190 });
      fireEvent.click(upper);

      expect(actions.reorderSplits).toHaveBeenCalledWith(programId, [
        splitBId,
        splitAId,
      ]);
      expect(router.push).not.toHaveBeenCalled();
      await findToast("Order saved.");
    });

    it("does not reorder when a press slips before the hold lifts the row", async () => {
      renderForm(<ProgramForm program={program} />);

      const upper = splitRow("Upper");
      fireEvent.pointerDown(upper, { pointerId: 1, clientY: 100 });
      fireEvent.pointerMove(upper, { pointerId: 1, clientY: 120 });
      await act(() => new Promise((resolve) => setTimeout(resolve, 220)));
      fireEvent.pointerUp(upper, { pointerId: 1, clientY: 190 });

      expect(upper).not.toHaveAttribute("data-drag");
      expect(actions.reorderSplits).not.toHaveBeenCalled();
    });

    it("puts the order back and reports a reorder the server refused", async () => {
      const user = userEvent.setup();
      actions.reorderSplits.mockResolvedValue({
        ok: false,
        error: { message: "Could not save the order." },
      });
      renderForm(<ProgramForm program={program} />);

      splitRow("Upper").focus();
      await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

      await findToast("Could not save the order.");
      expect(splitRow("Upper")).toHaveAccessibleName("Upper, position 1 of 2");
    });

    it("sets the next split from its panel", async () => {
      const user = userEvent.setup();
      actions.setNext.mockResolvedValue({
        ok: true,
        value: { ...program, nextSplitId: splitBId },
      });
      renderForm(<ProgramForm program={program} />);

      await runAction(user, "Set next split");
      const sheet = await screen.findByRole("dialog", {
        name: "Set next split",
      });
      expect(
        within(sheet).getByRole("button", { name: "Upper" }),
      ).toHaveAttribute("aria-pressed", "true");
      await user.click(within(sheet).getByRole("button", { name: "Lower" }));

      expect(actions.setNext).toHaveBeenCalledWith(programId, splitBId);
      expect(actions.setCurrentProgram).not.toHaveBeenCalled();
      await findToast("Next split updated.");
      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Set next split" }),
        ).not.toBeInTheDocument(),
      );
      expect(within(splitRow("Lower")).getByText("Next")).toBeVisible();
      expect(router.refresh).toHaveBeenCalled();
    });

    it("makes a program current by choosing its first split", async () => {
      const user = userEvent.setup();
      const other = { ...program, isCurrent: false };
      actions.setCurrentProgram.mockResolvedValue({
        ok: true,
        value: { ...other, isCurrent: true, nextSplitId: splitBId },
      });
      renderForm(<ProgramForm program={other} />);

      expect(screen.queryByText("Current program")).not.toBeInTheDocument();
      await runAction(user, "Make current program");
      const sheet = await screen.findByRole("dialog", {
        name: "Choose the first split",
      });
      await user.click(within(sheet).getByRole("button", { name: "Lower" }));

      expect(actions.setCurrentProgram).toHaveBeenCalledWith(
        programId,
        splitBId,
      );
      expect(actions.setNext).not.toHaveBeenCalled();
      await findToast("Program is now current.");
      expect(screen.getByText("Current program")).toBeVisible();
    });

    it("offers no next split for a program without splits", async () => {
      const user = userEvent.setup();
      renderForm(<ProgramForm program={{ ...program, splits: [] }} />);

      expect(
        screen.getByText(
          "Add the first split before making this program current.",
        ),
      ).toBeVisible();
      const panel = await openActions(user);
      expect(entryLabels(panel)).toEqual(["Save changes", "Delete program"]);
    });

    it("deletes a program only after confirming it", async () => {
      const user = userEvent.setup();
      actions.deleteProgram.mockResolvedValue({ ok: true, value: null });
      renderForm(<ProgramForm program={program} />);

      await runAction(user, "Delete program");
      const dialog = await screen.findByRole("alertdialog", {
        name: "Delete Strength?",
      });
      expect(actions.deleteProgram).not.toHaveBeenCalled();
      await user.click(
        within(dialog).getByRole("button", { name: "Delete program" }),
      );

      expect(actions.deleteProgram).toHaveBeenCalledWith(programId);
      await findToast("Program deleted.");
      expect(router.replace).toHaveBeenCalledWith("/programs");
    });

    it("keeps the program when its delete is cancelled", async () => {
      const user = userEvent.setup();
      renderForm(<ProgramForm program={program} />);

      await runAction(user, "Delete program");
      const dialog = await screen.findByRole("alertdialog", {
        name: "Delete Strength?",
      });
      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
      expect(actions.deleteProgram).not.toHaveBeenCalled();
    });
  });

  describe("SplitForm", () => {
    it("marks a new split Unsaved from the first frame and validates its name", async () => {
      const user = userEvent.setup();
      renderForm(<SplitForm program={program} exerciseLibrary={exercises} />);

      expect(screen.getByText("Unsaved")).toBeVisible();
      expect(screen.getByText("No exercises yet")).toBeVisible();
      const panel = await openActions(user);
      expect(entryLabels(panel)).toEqual(["Save split", "Add exercise"]);
      await user.click(
        within(panel).getByRole("button", { name: "Save split" }),
      );
      await user.click(within(panel).getByRole("button", { name: "Continue" }));

      await findToast("Enter a split name.");
      expect(screen.getByLabelText("Split name")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(actions.createSplit).not.toHaveBeenCalled();
    });

    it("creates a new split in its program with the exercises added", async () => {
      const user = userEvent.setup();
      actions.createSplit.mockResolvedValue({ ok: true, value: split });
      renderForm(<SplitForm program={program} exerciseLibrary={library} />);

      await user.type(screen.getByLabelText("Split name"), "Arms");
      await user.click(screen.getByRole("button", { name: "Add exercise" }));
      const sheet = await screen.findByRole("dialog", {
        name: "Add exercise",
      });
      await user.click(within(sheet).getByRole("button", { name: "Curl" }));
      await runAction(user, "Save split");

      await findToast("Split saved.");
      expect(actions.createSplit).toHaveBeenCalledWith(programId, {
        name: "Arms",
        exercises: [
          { exerciseId: exerciseCId, plannedSets: 3, minReps: 8, maxReps: 12 },
        ],
      });
      expect(actions.reorderExercises).not.toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith(
        `/programs/${programId}/edit`,
      );
    });

    it("returns to its program with a toast after saving a split", async () => {
      const user = userEvent.setup();
      actions.updateSplit.mockResolvedValue({ ok: true, value: split });
      renderForm(
        <SplitForm
          program={program}
          split={split}
          exerciseLibrary={exercises}
        />,
      );

      expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();

      await user.type(screen.getByLabelText("Split name"), " A");

      expect(screen.getByText("Unsaved")).toBeVisible();

      await runAction(user, "Save changes");

      await findToast("Split saved.");
      expect(actions.updateSplit).toHaveBeenCalledWith(splitAId, {
        name: "Upper A",
        exercises: [
          { exerciseId: exerciseAId, plannedSets: 3, minReps: 8, maxReps: 12 },
          { exerciseId: exerciseBId, plannedSets: 3, minReps: 8, maxReps: 12 },
        ],
      });
      expect(router.replace).toHaveBeenCalledWith(
        `/programs/${programId}/edit`,
      );
    });

    it("reports invalid rep ranges before saving a split", async () => {
      // The minus and plus buttons cannot cross the range any more (step 15),
      // so the save-time check is reached with a range already crossed.
      const user = userEvent.setup();
      const crossed: Split = {
        ...split,
        exercises: [{ ...split.exercises[0]!, minReps: 12, maxReps: 8 }],
      };
      renderForm(
        <SplitForm
          program={program}
          split={crossed}
          exerciseLibrary={exercises}
        />,
      );

      await user.type(screen.getByLabelText("Split name"), " A");
      await runAction(user, "Save changes");

      await findToast("Maximum reps must be at least the minimum reps.");
      expect(actions.updateSplit).not.toHaveBeenCalled();
    });

    it("steps each prescription within its bounds and tracks Unsaved", async () => {
      const user = userEvent.setup();
      const edge: Split = {
        ...split,
        exercises: [
          { ...split.exercises[0]!, plannedSets: 10, minReps: 8, maxReps: 9 },
          { ...split.exercises[1]!, plannedSets: 1, minReps: 1, maxReps: 180 },
        ],
      };
      actions.updateSplit.mockResolvedValue({ ok: true, value: edge });
      renderForm(
        <SplitForm
          program={program}
          split={edge}
          exerciseLibrary={exercises}
        />,
      );

      // Sets stop at 10 and at 1.
      await user.click(
        screen.getByRole("button", { name: "One set more, Press" }),
      );
      expect(wellValue("One set more, Press")).toBe("10");
      await user.click(
        screen.getByRole("button", { name: "One set fewer, Row" }),
      );
      expect(wellValue("One set more, Row")).toBe("1");
      // The maximum stops at 180, and the minimum at 1.
      await user.click(
        screen.getByRole("button", { name: "Raise the maximum, Row" }),
      );
      expect(wellValue("Raise the maximum, Row")).toBe("180");
      await user.click(
        screen.getByRole("button", { name: "Lower the minimum, Row" }),
      );
      expect(wellValue("Raise the minimum, Row")).toBe("1");
      expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();

      // The minimum never passes the maximum, nor the maximum the minimum.
      await user.click(
        screen.getByRole("button", { name: "Raise the minimum, Press" }),
      );
      expect(wellValue("Raise the minimum, Press")).toBe("9");
      expect(screen.getByText("Unsaved")).toBeVisible();
      await user.click(
        screen.getByRole("button", { name: "Raise the minimum, Press" }),
      );
      expect(wellValue("Raise the minimum, Press")).toBe("9");
      await user.click(
        screen.getByRole("button", { name: "Lower the maximum, Press" }),
      );
      expect(wellValue("Raise the maximum, Press")).toBe("9");

      // Putting the value back clears Unsaved.
      await user.click(
        screen.getByRole("button", { name: "Lower the minimum, Press" }),
      );
      expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "One set fewer, Press" }),
      );
      await runAction(user, "Save changes");

      await findToast("Split saved.");
      expect(actions.updateSplit).toHaveBeenCalledWith(splitAId, {
        name: "Upper",
        exercises: [
          { exerciseId: exerciseAId, plannedSets: 9, minReps: 8, maxReps: 9 },
          { exerciseId: exerciseBId, plannedSets: 1, minReps: 1, maxReps: 180 },
        ],
      });
    });

    it("removes a prescription and saves the split without it", async () => {
      const user = userEvent.setup();
      actions.updateSplit.mockResolvedValue({ ok: true, value: split });
      renderForm(
        <SplitForm
          program={program}
          split={split}
          exerciseLibrary={exercises}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Remove Press" }));

      expect(
        screen.queryByRole("region", { name: /^Press, position/ }),
      ).not.toBeInTheDocument();
      expect(prescriptionCard("Row")).toHaveAccessibleName(
        "Row, position 1 of 1",
      );
      expect(screen.getByText("Unsaved")).toBeVisible();

      await runAction(user, "Save changes");

      await findToast("Split saved.");
      expect(actions.updateSplit).toHaveBeenCalledWith(splitAId, {
        name: "Upper",
        exercises: [
          { exerciseId: exerciseBId, plannedSets: 3, minReps: 8, maxReps: 12 },
        ],
      });
    });

    it("adds only library exercises the split lacks, at 3 × 8–12 or 20–40 seconds", async () => {
      const user = userEvent.setup();
      renderForm(
        <SplitForm program={program} split={split} exerciseLibrary={library} />,
      );

      await runAction(user, "Add exercise");
      let sheet = await screen.findByRole("dialog", { name: "Add exercise" });
      expect(
        within(sheet)
          .getAllByRole("button")
          .filter((button) => button.hasAttribute("data-add-option"))
          .map((button) => button.getAttribute("aria-label")),
      ).toEqual(["Curl", "Plank"]);
      expect(
        within(sheet).getByText("Bodyweight · Seconds · 1 mode"),
      ).toBeVisible();
      await user.click(within(sheet).getByRole("button", { name: "Plank" }));

      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Add exercise" }),
        ).not.toBeInTheDocument(),
      );
      const plank = prescriptionCard("Plank");
      expect(plank).toHaveAccessibleName("Plank, position 3 of 3");
      expect(within(plank).getByText("Min sec")).toBeVisible();
      expect(within(plank).getByText("Max sec")).toBeVisible();
      expect(wellValue("One set more, Plank")).toBe("3");
      expect(wellValue("Raise the minimum, Plank")).toBe("20");
      expect(wellValue("Raise the maximum, Plank")).toBe("40");
      expect(screen.getByText("Unsaved")).toBeVisible();

      await user.click(screen.getByRole("button", { name: "Add exercise" }));
      sheet = await screen.findByRole("dialog", { name: "Add exercise" });
      await user.click(within(sheet).getByRole("button", { name: "Curl" }));

      const curl = prescriptionCard("Curl");
      expect(within(curl).getByText("Min reps")).toBeVisible();
      expect(wellValue("One set more, Curl")).toBe("3");
      expect(wellValue("Raise the minimum, Curl")).toBe("8");
      expect(wellValue("Raise the maximum, Curl")).toBe("12");

      await user.click(screen.getByRole("button", { name: "Add exercise" }));
      sheet = await screen.findByRole("dialog", { name: "Add exercise" });
      expect(
        within(sheet).getByText(
          "Every library exercise is already in this split.",
        ),
      ).toBeVisible();
    });

    it("reorders prescriptions of a saved split at once and blocks deleting the last split", async () => {
      const user = userEvent.setup();
      actions.reorderExercises.mockResolvedValue({ ok: true, value: split });
      renderForm(
        <SplitForm
          program={{ ...program, splits: [program.splits[0]!] }}
          split={split}
          exerciseLibrary={exercises}
        />,
      );

      prescriptionCard("Press").focus();
      await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

      expect(actions.reorderExercises).toHaveBeenCalledWith(splitAId, [
        exerciseBId,
        exerciseAId,
      ]);
      await findToast("Order saved.");
      expect(prescriptionCard("Press")).toHaveAccessibleName(
        "Press, position 2 of 2",
      );
      // A reorder that was written leaves nothing unsaved.
      expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();

      // The last split of the current program is no longer offered for
      // deletion (step 15, `sfCanDelete`), where it used to be a disabled
      // button with an explanation beside it.
      const panel = await openActions(user);
      expect(entryLabels(panel)).toEqual(["Save changes", "Add exercise"]);
    });

    it("moves a prescription by holding and dragging it", async () => {
      actions.reorderExercises.mockResolvedValue({ ok: true, value: split });
      renderForm(
        <SplitForm
          program={program}
          split={split}
          exerciseLibrary={exercises}
        />,
      );

      const row = prescriptionCard("Row");
      fireEvent.pointerDown(row, { pointerId: 1, clientY: 200 });
      await act(() => new Promise((resolve) => setTimeout(resolve, 220)));
      fireEvent.pointerMove(row, { pointerId: 1, clientY: 110 });
      fireEvent.pointerUp(row, { pointerId: 1, clientY: 110 });

      expect(actions.reorderExercises).toHaveBeenCalledWith(splitAId, [
        exerciseBId,
        exerciseAId,
      ]);
      await findToast("Order saved.");
    });

    it("keeps the order for Save while prescriptions hold unsaved changes", async () => {
      const user = userEvent.setup();
      actions.updateSplit.mockResolvedValue({ ok: true, value: split });
      renderForm(
        <SplitForm
          program={program}
          split={split}
          exerciseLibrary={exercises}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: "One set more, Row" }),
      );
      prescriptionCard("Row").focus();
      await user.keyboard("{Alt>}{ArrowUp}{/Alt}");

      expect(actions.reorderExercises).not.toHaveBeenCalled();
      expect(prescriptionCard("Row")).toHaveAccessibleName(
        "Row, position 1 of 2",
      );
      expect(screen.getByText("Unsaved")).toBeVisible();

      await runAction(user, "Save changes");

      await findToast("Split saved.");
      expect(actions.updateSplit).toHaveBeenCalledWith(splitAId, {
        name: "Upper",
        exercises: [
          { exerciseId: exerciseBId, plannedSets: 4, minReps: 8, maxReps: 12 },
          { exerciseId: exerciseAId, plannedSets: 3, minReps: 8, maxReps: 12 },
        ],
      });
    });

    it("offers Delete split for the only split of a program that is not current", async () => {
      const user = userEvent.setup();
      renderForm(
        <SplitForm
          program={{
            ...program,
            isCurrent: false,
            splits: [program.splits[0]!],
          }}
          split={split}
          exerciseLibrary={exercises}
        />,
      );

      const panel = await openActions(user);
      expect(entryLabels(panel)).toEqual([
        "Save changes",
        "Add exercise",
        "Delete split",
      ]);
    });

    it("deletes a split of a program that keeps another one", async () => {
      const user = userEvent.setup();
      actions.deleteSplit.mockResolvedValue({ ok: true, value: null });
      renderForm(
        <SplitForm
          program={program}
          split={split}
          exerciseLibrary={exercises}
        />,
      );

      await runAction(user, "Delete split");
      const dialog = await screen.findByRole("alertdialog", {
        name: "Delete Upper?",
      });
      // Upper is next, so the dialog says where the pointer goes.
      expect(
        within(dialog).getByText(
          "The next split moves to Lower. Workouts already recorded keep this split in History.",
        ),
      ).toBeVisible();
      expect(actions.deleteSplit).not.toHaveBeenCalled();
      await user.click(
        within(dialog).getByRole("button", { name: "Delete split" }),
      );

      expect(actions.deleteSplit).toHaveBeenCalledWith(splitAId);
      await findToast("Split deleted.");
      expect(router.replace).toHaveBeenCalledWith(
        `/programs/${programId}/edit`,
      );
    });
  });
});
