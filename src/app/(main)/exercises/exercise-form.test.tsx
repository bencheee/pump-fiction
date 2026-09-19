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
        { name: "Bodyweight" },
      ),
    );

    const bodyweightAdditions = within(
      screen.getByRole("group", { name: "Optional per-set additions" }),
    );
    expect(screen.getByText("Every set stores reps.")).toBeVisible();
    expect(bodyweightAdditions.getAllByRole("button")).toHaveLength(4);
    expect(
      bodyweightAdditions.getByRole("button", { name: /Add weight/ }),
    ).toBeVisible();
    expect(
      bodyweightAdditions.getByRole("button", { name: /Assist with weight/ }),
    ).toBeVisible();
    expect(
      bodyweightAdditions.getByRole("button", { name: /Assist with band/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Assisted" }),
    ).not.toBeInTheDocument();
  });

  it("keeps at most one addition", async () => {
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
      measurementType: "reps",
      allowedLoadModes: ["bodyweight", "bodyweight_resistance_band"],
      persistentNote: "",
    });
  });

  it("defaults to reps and can save a seconds override", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: { id: "created" } });
    renderForm(<ExerciseForm />);

    const measurement = screen.getByRole("group", {
      name: "Set measurement options",
    });
    expect(
      within(measurement).getByRole("button", { name: "Reps" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(
      within(measurement).getByRole("button", { name: "Seconds" }),
    );
    await user.type(screen.getByLabelText("Name"), "Side plank");
    await user.click(screen.getByRole("button", { name: "Save Exercise" }));

    expect(actions.create).toHaveBeenCalledWith(
      expect.objectContaining({ measurementType: "seconds" }),
    );
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
        { name: "Bodyweight" },
      ),
    );

    const assistWithWeight = screen.getByRole("button", {
      name: /Assist with weight/,
    });
    const assistWithBand = screen.getByRole("button", {
      name: /Assist with band/,
    });
    expect(assistWithWeight).toHaveAttribute("aria-pressed", "false");

    await user.click(assistWithWeight);

    expect(assistWithWeight).toHaveAttribute("aria-pressed", "true");

    await user.click(assistWithBand);

    expect(assistWithWeight).toHaveAttribute("aria-pressed", "false");
    expect(assistWithBand).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Save Exercise" }));

    expect(screen.getByText("Enter a name for this exercise.")).toBeVisible();
    expect(actions.create).not.toHaveBeenCalled();
  });

  it("saves a bodyweight exercise that assists with weight", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: { id: "created" } });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Name"), "Assisted dip");
    await user.click(
      within(screen.getByRole("group", { name: "Exercise type" })).getByRole(
        "button",
        { name: "Bodyweight" },
      ),
    );
    await user.click(
      screen.getByRole("button", { name: /Assist with weight/ }),
    );
    await user.click(screen.getByRole("button", { name: "Save Exercise" }));

    expect(actions.create).toHaveBeenCalledWith({
      name: "Assisted dip",
      baseType: "bodyweight",
      measurementType: "reps",
      allowedLoadModes: ["bodyweight", "assistance_weight"],
      persistentNote: "",
    });
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
