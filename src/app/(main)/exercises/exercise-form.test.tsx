// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/shared/ui";

import { ExerciseForm } from "./exercise-form";

const actions = vi.hoisted(() => ({
  archive: vi.fn(),
  create: vi.fn(),
  reactivate: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/app/actions/exercises", () => ({
  archiveExerciseAction: actions.archive,
  createExerciseAction: actions.create,
  reactivateExerciseAction: actions.reactivate,
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

  it("shows only load modes compatible with the selected type", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    expect(
      screen.getByRole("button", { name: /WeightKilograms and reps/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Assistance weight/ }),
    ).not.toBeInTheDocument();

    await user.click(
      within(screen.getByRole("group", { name: "Exercise type" })).getByRole(
        "button",
        { name: "Assisted" },
      ),
    );

    expect(
      screen.getByRole("button", { name: /Assistance weight/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Assistance band/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Kilograms and reps/ }),
    ).not.toBeInTheDocument();
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

  it("reports name and load-mode validation before calling the action", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    await user.click(
      within(screen.getByRole("group", { name: "Exercise type" })).getByRole(
        "button",
        { name: "Bodyweight" },
      ),
    );
    await user.click(
      screen.getByRole("button", { name: /BodyweightReps only/ }),
    );
    await user.click(screen.getByRole("button", { name: "Save Exercise" }));

    expect(screen.getByText("Enter a name for this exercise.")).toBeVisible();
    expect(
      screen.getByText("Select at least one permitted load mode."),
    ).toBeVisible();
    expect(actions.create).not.toHaveBeenCalled();
  });
});
