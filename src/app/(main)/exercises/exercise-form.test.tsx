// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
}));

describe("ExerciseForm", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows only load modes compatible with the selected type", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

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

  it("preserves successful save feedback when create redirects to edit", () => {
    render(<ExerciseForm initiallySaved />);

    expect(screen.getByText("Saved", { exact: true })).toBeVisible();
    expect(window.location.search).toBe("");
  });

  it("reports name and load-mode validation before calling the action", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

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
