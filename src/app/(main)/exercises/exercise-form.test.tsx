// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/shared/ui";

import { ExerciseForm } from "./exercise-form";

const actions = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/app/actions/exercises", () => ({
  createExerciseAction: actions.create,
  deleteExerciseAction: actions.delete,
  updateExerciseAction: actions.update,
}));

const router = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));

function renderForm(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("ExerciseForm", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("offers only the optional additions of the selected type", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    const additions = within(
      screen.getByRole("group", { name: "Optional per-set additions" }),
    );
    expect(
      screen.getByText("Every set stores kilograms and reps."),
    ).toBeVisible();
    expect(
      additions.getByRole("button", { name: /Add resistance band/ }),
    ).toBeVisible();
    expect(additions.getAllByRole("button")).toHaveLength(1);

    await user.click(
      within(screen.getByRole("group", { name: "Exercise type" })).getByRole(
        "button",
        { name: "Assisted" },
      ),
    );

    const assistance = within(
      screen.getByRole("group", { name: "Assistance mode" }),
    );
    expect(
      assistance.getByRole("button", { name: /Assistance weight/ }),
    ).toBeVisible();
    expect(
      assistance.getByRole("button", { name: /Assistance band/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Add resistance band/ }),
    ).not.toBeInTheDocument();
  });

  it("keeps at most one addition and exactly one assistance mode", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: { id: "created" } });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Name"), "Pull-up");
    await user.click(
      within(screen.getByRole("group", { name: "Exercise type" })).getByRole(
        "button",
        { name: "Bodyweight" },
      ),
    );

    const addWeight = screen.getByRole("button", { name: /Add weight/ });
    const addBand = screen.getByRole("button", { name: /Add resistance band/ });
    await user.click(addWeight);
    await user.click(addBand);

    expect(addWeight).toHaveAttribute("aria-pressed", "false");
    expect(addBand).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Save Exercise" }));

    expect(actions.create).toHaveBeenCalledWith({
      name: "Pull-up",
      baseType: "bodyweight",
      allowedLoadModes: ["bodyweight", "bodyweight_resistance_band"],
      persistentNote: "",
    });
  });

  it("reports unsaved changes only after the form is edited", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "Bench press");

    expect(screen.getByText("Unsaved changes")).toBeVisible();
  });

  it("returns to the exercise list with a toast after saving", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({
      ok: true,
      value: { id: "created", name: "Bench press" },
    });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Name"), "Bench press");
    await user.click(screen.getByRole("button", { name: "Save Exercise" }));

    expect(actions.create).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/exercises");
    expect(screen.getByText("Exercise saved.")).toBeVisible();
  });

  it("keeps the form open and reports a failed save", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({
      ok: false,
      error: {
        code: "conflict",
        message: "Another active exercise already uses this name.",
        retryable: false,
      },
    });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Name"), "Bench press");
    await user.click(screen.getByRole("button", { name: "Save Exercise" }));

    expect(router.replace).not.toHaveBeenCalled();
    expect(
      screen.getAllByText("Another active exercise already uses this name."),
    ).toHaveLength(2);
  });

  it("keeps one assistance mode selected and reports name validation", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    await user.click(
      within(screen.getByRole("group", { name: "Exercise type" })).getByRole(
        "button",
        { name: "Assisted" },
      ),
    );

    const assistanceWeight = screen.getByRole("button", {
      name: /Assistance weight/,
    });
    const assistanceBand = screen.getByRole("button", {
      name: /Assistance band/,
    });
    expect(assistanceWeight).toHaveAttribute("aria-pressed", "true");

    await user.click(assistanceBand);

    expect(assistanceWeight).toHaveAttribute("aria-pressed", "false");
    expect(assistanceBand).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Save Exercise" }));

    expect(screen.getByText("Enter a name for this exercise.")).toBeVisible();
    expect(actions.create).not.toHaveBeenCalled();
  });

  it("names the affected splits before deleting an exercise", async () => {
    const user = userEvent.setup();
    actions.delete.mockResolvedValue({ ok: true, value: null });
    renderForm(
      <ExerciseForm
        exercise={{
          id: "11111111-1111-4111-8111-111111111111",
          name: "Pull-up",
          baseType: "bodyweight",
          allowedLoadModes: ["bodyweight", "bodyweight_added_weight"],
          persistentNote: "",
          splitUsageCount: 2,
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete Exercise" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete exercise?",
    });
    expect(
      within(dialog).getByText(
        "It is removed from 2 splits. Workouts already recorded keep this exercise in History.",
      ),
    ).toBeVisible();

    await user.click(
      within(dialog).getByRole("button", { name: "Delete Exercise" }),
    );

    expect(actions.delete).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(router.replace).toHaveBeenCalledWith("/exercises");
    expect(screen.getByText("Exercise deleted.")).toBeVisible();
  });
});
