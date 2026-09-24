// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Exercise } from "@/features/exercises/domain/exercise";
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

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/exercises/new",
}));

type User = ReturnType<typeof userEvent.setup>;

const pullUp: Exercise = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Pull-up",
  baseType: "bodyweight",
  measurementType: "reps",
  allowedLoadModes: ["bodyweight", "bodyweight_added_weight"],
  persistentNote: "",
  splitUsageCount: 2,
};

function renderForm(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

function section(name: string) {
  return within(screen.getByRole("region", { name }));
}

async function chooseType(user: User, type: "Weights" | "Bodyweight") {
  await user.click(section("Type").getByRole("button", { name: type }));
}

/*
 * Save and Delete live in the Actions panel since step 17 of
 * docs/design/redesign-v2/PLAN.md: a press picks an entry and Continue runs
 * it, once the panel has given its history entry back.
 */
async function runAction(user: User, entry: string) {
  await user.click(screen.getByRole("button", { name: "Actions" }));
  const panel = await screen.findByRole("dialog", { name: "Actions" });
  const continueButton = within(panel).getByRole("button", {
    name: "Continue",
  });
  expect(continueButton).toBeDisabled();
  await user.click(within(panel).getByRole("button", { name: entry }));
  expect(continueButton).toBeEnabled();
  await user.click(continueButton);
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Actions" }),
    ).not.toBeInTheDocument(),
  );
}

describe("ExerciseForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/exercises/new");
  });
  afterEach(cleanup);

  it("offers only the optional additions of the selected type", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    expect(
      section("Type").getByRole("button", { name: "Weights" }),
    ).toHaveAttribute("aria-pressed", "true");
    const additions = section("Optional per-set additions");
    expect(
      screen.getByText("Every set stores kilograms and reps."),
    ).toBeVisible();
    expect(
      additions.getByRole("button", { name: "Add resistance band" }),
    ).toBeVisible();
    expect(additions.getAllByRole("button")).toHaveLength(1);

    await chooseType(user, "Bodyweight");

    const bodyweightAdditions = section("Optional per-set additions");
    expect(screen.getByText("Every set stores reps.")).toBeVisible();
    expect(bodyweightAdditions.getAllByRole("button")).toHaveLength(4);
    for (const name of [
      "Add weight",
      "Add resistance band",
      "Assist with weight",
      "Assist with band",
    ])
      expect(bodyweightAdditions.getByRole("button", { name })).toBeVisible();
    // The implied mode is never offered as a choice (MVP-EXE-001), and
    // assistance is an addition rather than a type of its own (MVP-EXE-004).
    expect(
      screen.queryByRole("button", { name: "Bodyweight only" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Assisted" }),
    ).not.toBeInTheDocument();
  });

  it("keeps at most one addition", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: { id: "created" } });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Exercise name"), "Pull-up");
    await chooseType(user, "Bodyweight");

    const addWeight = screen.getByRole("button", { name: "Add weight" });
    const addBand = screen.getByRole("button", { name: "Add resistance band" });
    await user.click(addWeight);
    await user.click(addBand);

    expect(addWeight).toHaveAttribute("aria-pressed", "false");
    expect(addBand).toHaveAttribute("aria-pressed", "true");

    await runAction(user, "Save exercise");

    expect(actions.create).toHaveBeenCalledWith({
      name: "Pull-up",
      baseType: "bodyweight",
      measurementType: "reps",
      allowedLoadModes: ["bodyweight", "bodyweight_resistance_band"],
      persistentNote: "",
    });
  });

  it("takes an addition off again when it is pressed a second time", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: { id: "created" } });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Exercise name"), "Push-up");
    await chooseType(user, "Bodyweight");
    const addWeight = screen.getByRole("button", { name: "Add weight" });
    await user.click(addWeight);
    await user.click(addWeight);

    expect(addWeight).toHaveAttribute("aria-pressed", "false");

    await runAction(user, "Save exercise");

    expect(actions.create).toHaveBeenCalledWith(
      expect.objectContaining({ allowedLoadModes: ["bodyweight"] }),
    );
  });

  it("clears an addition the new type does not offer and says so", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: { id: "created" } });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Exercise name"), "Band row");
    await user.click(
      screen.getByRole("button", { name: "Add resistance band" }),
    );
    await chooseType(user, "Bodyweight");

    expect(
      screen.getByText("Choices that do not apply to this type were cleared."),
    ).toBeVisible();
    for (const button of section("Optional per-set additions").getAllByRole(
      "button",
    ))
      expect(button).toHaveAttribute("aria-pressed", "false");

    await runAction(user, "Save exercise");

    expect(actions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseType: "bodyweight",
        allowedLoadModes: ["bodyweight"],
      }),
    );
  });

  it("changes type without a word when there is nothing to clear", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    await chooseType(user, "Bodyweight");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("defaults to reps and can save a seconds override", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: { id: "created" } });
    renderForm(<ExerciseForm />);

    const measurement = section("Set measurement");
    expect(measurement.getByRole("button", { name: "Reps" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText("Each set records a repetition count."),
    ).toBeVisible();

    await user.click(measurement.getByRole("button", { name: "Seconds" }));

    expect(
      measurement.getByRole("button", { name: "Seconds" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText("Each set records its duration in seconds."),
    ).toBeVisible();
    expect(
      screen.getByText("Every set stores kilograms and seconds."),
    ).toBeVisible();

    await user.type(screen.getByLabelText("Exercise name"), "Side plank");
    await runAction(user, "Save exercise");

    expect(actions.create).toHaveBeenCalledWith(
      expect.objectContaining({ measurementType: "seconds" }),
    );
  });

  it("marks a new exercise unsaved from its first frame", () => {
    // Step 17 of docs/design/redesign-v2/PLAN.md: a new definition is a draft
    // from the moment it opens (`dfAdd`), where it used to read unsaved only
    // once something had been typed.
    renderForm(<ExerciseForm />);

    expect(screen.getByText("Unsaved")).toBeVisible();
  });

  it("marks a saved exercise unsaved only while it differs", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm exercise={pullUp} />);

    expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();

    const addWeight = screen.getByRole("button", { name: "Add weight" });
    expect(addWeight).toHaveAttribute("aria-pressed", "true");
    await user.click(
      screen.getByRole("button", { name: "Assist with weight" }),
    );

    expect(screen.getByText("Unsaved")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    const panel = await screen.findByRole("dialog", { name: "Actions" });
    expect(
      within(panel).getByText("Bodyweight · Reps · 2 modes · Unsaved changes"),
    ).toBeVisible();
    await user.click(within(panel).getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Actions" }),
      ).not.toBeInTheDocument(),
    );

    await user.click(addWeight);

    expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();
  });

  it("returns to the exercise list with a toast after saving", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({
      ok: true,
      value: { id: "created", name: "Bench press" },
    });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Exercise name"), "Bench press");
    await user.type(
      screen.getByRole("textbox", { name: /Exercise note/ }),
      "Shoulder blades back",
    );
    await runAction(user, "Save exercise");

    expect(actions.create).toHaveBeenCalledTimes(1);
    expect(actions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Bench press",
        persistentNote: "Shoulder blades back",
      }),
    );
    expect(router.replace).toHaveBeenCalledWith("/exercises");
    expect(screen.getByText("Exercise saved.")).toBeVisible();
  });

  it("saves changes to an existing exercise under its own id", async () => {
    const user = userEvent.setup();
    actions.update.mockResolvedValue({ ok: true, value: pullUp });
    renderForm(<ExerciseForm exercise={pullUp} />);

    const name = screen.getByLabelText("Exercise name");
    await user.clear(name);
    await user.type(name, "Weighted pull-up");
    await runAction(user, "Save exercise");

    expect(actions.create).not.toHaveBeenCalled();
    expect(actions.update).toHaveBeenCalledWith(pullUp.id, {
      name: "Weighted pull-up",
      baseType: "bodyweight",
      measurementType: "reps",
      allowedLoadModes: ["bodyweight", "bodyweight_added_weight"],
      persistentNote: "",
    });
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
        fieldErrors: {
          name: ["Another active exercise already uses this name."],
        },
      },
    });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Exercise name"), "Bench press");
    await runAction(user, "Save exercise");

    expect(router.replace).not.toHaveBeenCalled();
    // The prototype reports a refusal in a toast alone (step 17), where the
    // form used to repeat it inline beside the field as well.
    expect(
      screen.getByText("Another active exercise already uses this name."),
    ).toBeVisible();
    expect(screen.getByLabelText("Exercise name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Exercise name")).toHaveValue("Bench press");
  });

  it("keeps one assistance mode selected and reports name validation", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    await chooseType(user, "Bodyweight");

    const assistWithWeight = screen.getByRole("button", {
      name: "Assist with weight",
    });
    const assistWithBand = screen.getByRole("button", {
      name: "Assist with band",
    });
    expect(assistWithWeight).toHaveAttribute("aria-pressed", "false");

    await user.click(assistWithWeight);

    expect(assistWithWeight).toHaveAttribute("aria-pressed", "true");

    await user.click(assistWithBand);

    expect(assistWithWeight).toHaveAttribute("aria-pressed", "false");
    expect(assistWithBand).toHaveAttribute("aria-pressed", "true");

    await runAction(user, "Save exercise");

    // Step 17: the prototype's own words, in a toast, with the field marked.
    expect(await screen.findByText("Enter an exercise name.")).toBeVisible();
    expect(screen.getByLabelText("Exercise name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(actions.create).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Exercise name"), "D");

    expect(screen.getByLabelText("Exercise name")).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("saves a bodyweight exercise that assists with weight", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: { id: "created" } });
    renderForm(<ExerciseForm />);

    await user.type(screen.getByLabelText("Exercise name"), "Assisted dip");
    await chooseType(user, "Bodyweight");
    await user.click(
      screen.getByRole("button", { name: "Assist with weight" }),
    );
    await runAction(user, "Save exercise");

    expect(actions.create).toHaveBeenCalledWith({
      name: "Assisted dip",
      baseType: "bodyweight",
      measurementType: "reps",
      allowedLoadModes: ["bodyweight", "assistance_weight"],
      persistentNote: "",
    });
  });

  it("offers no delete while the exercise has never been saved", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm />);

    await user.click(screen.getByRole("button", { name: "Actions" }));
    const panel = await screen.findByRole("dialog", { name: "Actions" });

    expect(
      within(panel).getByText("New definition · Unsaved changes"),
    ).toBeVisible();
    expect(
      within(panel).getByRole("button", { name: "Save exercise" }),
    ).toBeVisible();
    expect(
      within(panel).queryByRole("button", { name: "Delete exercise" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Used in/)).not.toBeInTheDocument();
  });

  it("states how many splits use an exercise being edited", () => {
    renderForm(<ExerciseForm exercise={pullUp} />);

    expect(screen.getByText("Used in 2 splits")).toBeVisible();
    expect(
      screen.getByText(
        "Changes affect future workouts only. Saved and active workouts keep their snapshots.",
      ),
    ).toBeVisible();
  });

  it("names the affected splits before deleting an exercise", async () => {
    const user = userEvent.setup();
    actions.delete.mockResolvedValue({ ok: true, value: null });
    renderForm(<ExerciseForm exercise={pullUp} />);

    await runAction(user, "Delete exercise");
    // The prototype's `doDeleteDef` names the exercise in the title.
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete Pull-up?",
    });
    expect(
      within(dialog).getByText(
        "It is removed from 2 splits. Workouts already recorded keep this exercise in History.",
      ),
    ).toBeVisible();
    expect(actions.delete).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("button", { name: "Delete exercise" }),
    );

    expect(actions.delete).toHaveBeenCalledWith(pullUp.id);
    expect(router.replace).toHaveBeenCalledWith("/exercises");
    expect(screen.getByText("Exercise deleted.")).toBeVisible();
  });

  it("deletes nothing when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    renderForm(<ExerciseForm exercise={{ ...pullUp, splitUsageCount: 0 }} />);

    await runAction(user, "Delete exercise");
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete Pull-up?",
    });
    expect(
      within(dialog).getByText(
        "No split uses it. Workouts already recorded keep this exercise in History.",
      ),
    ).toBeVisible();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(actions.delete).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
