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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ActiveWorkoutCommand } from "@/features/active-workout/domain/active-workout-command";
import type { ActiveWorkoutCommandResult } from "@/features/active-workout/application/active-workout-command-result";
import type { ActiveWorkoutCommandTransport } from "@/features/active-workout/client/active-workout-command-transport";
import type {
  ActiveWorkoutOutbox,
  PendingActiveWorkoutCommand,
} from "@/features/active-workout/client/active-workout-outbox";
import type {
  CurrentWorkout,
  WorkoutSet,
} from "@/features/active-workout/domain/workout";
import type { Exercise } from "@/features/exercises/domain/exercise";

import { ActiveWorkoutExperience } from "./active-workout-experience";
import { FinishReview } from "./finish/finish-review";

const actions = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  getCurrent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: actions.push,
    replace: actions.replace,
    refresh: actions.refresh,
  }),
}));
vi.mock("@/app/actions/workouts", () => ({
  getCurrentWorkoutAction: actions.getCurrent,
}));

const workoutId = "00000000-0000-4000-8000-00000000000a";
const squatOccurrence = "00000000-0000-4000-8000-00000000000b";
const pullUpOccurrence = "00000000-0000-4000-8000-00000000000c";

class FakeOutbox implements ActiveWorkoutOutbox {
  private sequence = 0;
  private items: PendingActiveWorkoutCommand[] = [];

  async enqueue(command: ActiveWorkoutCommand): Promise<void> {
    this.sequence += 1;
    this.items.push({ sequence: this.sequence, command });
  }
  async list(
    filterWorkoutId?: string,
  ): Promise<readonly PendingActiveWorkoutCommand[]> {
    return this.items.filter(
      (item) =>
        filterWorkoutId === undefined ||
        item.command.workoutId === filterWorkoutId,
    );
  }
  async remove(commandId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.command.commandId !== commandId,
    );
  }
}

class FakeTransport implements ActiveWorkoutCommandTransport {
  commands: ActiveWorkoutCommand[] = [];

  async deliver(
    command: ActiveWorkoutCommand,
  ): Promise<ActiveWorkoutCommandResult> {
    this.commands.push(command);
    return {
      kind: "acknowledged",
      acknowledgement: {
        commandId: command.commandId,
        workoutId: command.workoutId,
        expectedRevision: command.expectedRevision,
        resultingRevision: command.expectedRevision + 1,
        duplicate: false,
      },
    };
  }

  last(operation: ActiveWorkoutCommand["operation"]): ActiveWorkoutCommand {
    const match = [...this.commands]
      .reverse()
      .find((command) => command.operation === operation);
    if (match === undefined) throw new Error(`No ${operation} delivered.`);
    return match;
  }
}

function makeSet(overrides: Partial<WorkoutSet> & { id: string }): WorkoutSet {
  return {
    position: 1,
    loadMode: null,
    loadKg: null,
    bandDirection: null,
    bandStrength: null,
    reps: null,
    isConfirmed: false,
    ...overrides,
  };
}

function makeWorkout(overrides?: Partial<CurrentWorkout>): CurrentWorkout {
  return {
    id: workoutId,
    status: "active",
    sourceKind: "proposed_split",
    sourceProgramId: null,
    sourceSplitId: null,
    name: "Lower Body",
    workoutDate: "2026-09-04",
    startedAt: "2026-09-04T10:00:00.000Z",
    accumulatedActiveSeconds: 300,
    activeSegmentStartedAt: null,
    revision: 4,
    exercises: [
      {
        id: squatOccurrence,
        exerciseId: "00000000-0000-4000-8000-0000000000f1",
        position: 1,
        exerciseName: "Squat",
        exerciseBaseType: "weights",
        allowedLoadModes: ["weight", "weight_resistance_band"],
        persistentNote: "Brace before unracking.",
        plannedSets: 3,
        minReps: 5,
        maxReps: 8,
        workoutNote: "",
        sets: [
          makeSet({
            id: "00000000-0000-4000-8000-0000000000d1",
            position: 1,
            loadMode: "weight",
            loadKg: 82.5,
            reps: 6,
            isConfirmed: true,
          }),
          makeSet({
            id: "00000000-0000-4000-8000-0000000000d2",
            position: 2,
            loadMode: "weight",
          }),
          makeSet({
            id: "00000000-0000-4000-8000-0000000000d3",
            position: 3,
            loadMode: "weight",
          }),
        ],
        lastPerformance: {
          workoutId: "00000000-0000-4000-8000-0000000000aa",
          workoutDate: "2026-08-22",
          sets: [
            makeSet({
              id: "00000000-0000-4000-8000-0000000000d9",
              loadMode: "weight",
              loadKg: 85,
              reps: 6,
              isConfirmed: true,
            }),
          ],
        },
      },
      {
        id: pullUpOccurrence,
        exerciseId: "00000000-0000-4000-8000-0000000000f2",
        position: 2,
        exerciseName: "Pull-Up",
        exerciseBaseType: "bodyweight",
        allowedLoadModes: ["bodyweight", "bodyweight_added_weight"],
        persistentNote: "",
        plannedSets: 2,
        minReps: 6,
        maxReps: 10,
        workoutNote: "",
        sets: [
          makeSet({
            id: "00000000-0000-4000-8000-0000000000e1",
            position: 1,
            loadMode: "bodyweight_added_weight",
            loadKg: 5,
            reps: 8,
          }),
          makeSet({
            id: "00000000-0000-4000-8000-0000000000e2",
            position: 2,
            loadMode: "bodyweight",
          }),
        ],
        lastPerformance: null,
      },
    ],
    ...overrides,
  };
}

const library: readonly Exercise[] = [
  {
    id: "00000000-0000-4000-8000-0000000000f3",
    name: "Face Pull",
    baseType: "bodyweight",
    allowedLoadModes: ["bodyweight", "bodyweight_resistance_band"],
    persistentNote: "",
    splitUsageCount: 0,
  },
];

function renderExperience(workout = makeWorkout()) {
  const outbox = new FakeOutbox();
  const transport = new FakeTransport();
  render(
    <ActiveWorkoutExperience
      initial={workout}
      exercises={library}
      outbox={outbox}
      transport={transport}
    />,
  );
  return { outbox, transport };
}

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  actions.getCurrent.mockResolvedValue({
    ok: false,
    error: {
      code: "persistence",
      message: "Unavailable in this test.",
      retryable: true,
    },
  });
});

afterEach(cleanup);

describe("Active-workout mobile experience", () => {
  it("renders the canonical S10 state with snapshots, Last time, and mode fields", async () => {
    renderExperience();

    expect(
      screen.getByText("3 planned × 5–8 reps · 1 of 3 confirmed"),
    ).toBeVisible();
    expect(
      screen.getByText("2 planned × 6–10 reps · 0 of 2 confirmed"),
    ).toBeVisible();
    expect(screen.getByText("Brace before unracking.")).toBeVisible();
    expect(screen.getByText("22 Aug · 85 kg × 6")).toBeVisible();
    expect(screen.getByText("No completed performance yet.")).toBeVisible();
    expect(screen.getByText("Confirmed", { exact: true })).toBeVisible();

    const squat = screen.getByRole("region", { name: "Squat" });
    expect(within(squat).getAllByLabelText("kg")).toHaveLength(3);
    const pullUp = screen.getByRole("region", { name: "Pull-Up" });
    expect(within(pullUp).getByLabelText("added kg")).toBeVisible();
    expect(
      within(pullUp).getAllByRole("button", { name: /Add weight/ }),
    ).toHaveLength(1);
    expect(
      within(pullUp).getByRole("button", { name: "Remove added weight" }),
    ).toBeVisible();
    expect(
      within(squat).queryByRole("group", { name: "Resistance band" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Reps")).toHaveLength(5);
    expect(await screen.findByText("All changes saved")).toBeVisible();
  });

  it("blocks confirmation without required values and mirrors the message", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();
    const squat = screen.getByRole("region", { name: "Squat" });

    await user.click(
      within(squat).getByRole("button", { name: "Confirm set 2 of Squat" }),
    );
    expect(
      screen.getAllByText("Enter kg and reps to confirm this set."),
    ).toHaveLength(2);
    expect(transport.commands).toHaveLength(0);

    await user.type(within(squat).getAllByLabelText("kg")[1]!, "90");
    await user.type(within(squat).getAllByLabelText("Reps")[1]!, "5");
    await user.click(
      within(squat).getByRole("button", { name: "Confirm set 2 of Squat" }),
    );

    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        loadKg: 90,
        reps: 5,
        isConfirmed: true,
      });
    });
    expect(
      screen.queryByText("Enter kg and reps to confirm this set."),
    ).not.toBeInTheDocument();
  });

  it("removes the definition's addition from a set and keeps its reps", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();
    const pullUp = screen.getByRole("region", { name: "Pull-Up" });

    expect(
      within(pullUp).queryByRole("button", { name: /Change load mode/ }),
    ).not.toBeInTheDocument();

    await user.click(
      within(pullUp).getByRole("button", { name: "Remove added weight" }),
    );

    expect(
      await screen.findByText("Cleared added kg. Set returned to unconfirmed."),
    ).toBeVisible();
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        loadMode: "bodyweight",
        loadKg: null,
        reps: 8,
        isConfirmed: false,
      });
    });
  });

  it("applies the definition's single addition to one set only", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();
    const squat = screen.getByRole("region", { name: "Squat" });

    expect(
      within(squat).queryByRole("group", { name: "Resistance band" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(squat).getAllByRole("button", {
        name: "Add resistance band",
      })[1]!,
    );

    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        workoutSetId: "00000000-0000-4000-8000-0000000000d2",
        loadMode: "weight_resistance_band",
        isConfirmed: false,
      });
    });
    expect(
      within(squat).getByRole("group", { name: "Resistance band" }),
    ).toBeVisible();
    expect(within(squat).getAllByLabelText("kg")).toHaveLength(3);
  });

  it("returns a confirmed set to unconfirmed when a value changes", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();
    const squat = screen.getByRole("region", { name: "Squat" });

    const firstLoad = within(squat).getAllByLabelText("kg")[0]!;
    await user.clear(firstLoad);
    await user.type(firstLoad, "80");
    await user.tab();

    expect(
      await screen.findByText("Set returned to unconfirmed."),
    ).toBeVisible();
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        loadKg: 80,
        isConfirmed: false,
      });
    });
  });

  it("gates populated removals behind confirmation and removes empty rows directly", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    const pullUp = screen.getByRole("region", { name: "Pull-Up" });
    await user.click(within(pullUp).getAllByText("Remove set")[0]!);
    const dialog = await screen.findByRole("alertdialog", {
      name: "Remove set 1 of Pull-Up?",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Remove Set" }),
    );
    await waitFor(() => {
      expect(transport.last("remove_set").payload).toMatchObject({
        confirmedPopulatedRemoval: true,
      });
    });

    const squat = screen.getByRole("region", { name: "Squat" });
    await user.click(within(squat).getAllByText("Remove set")[2]!);
    await waitFor(() => {
      expect(transport.last("remove_set").payload).toMatchObject({
        confirmedPopulatedRemoval: false,
      });
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("pauses and resumes the timer with non-color state cues", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await user.click(screen.getByRole("button", { name: "Continue Later" }));
    expect(
      await screen.findByText("Paused — active duration is not counting."),
    ).toBeVisible();
    await waitFor(() => {
      expect(transport.last("pause_timer")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Resume" }));
    await waitFor(() => {
      expect(transport.last("resume_timer")).toBeDefined();
    });
    expect(
      screen.queryByText("Paused — active duration is not counting."),
    ).not.toBeInTheDocument();
  });

  it("reorders exercises through explicit buttons and enqueues the full order", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await user.click(screen.getByRole("button", { name: "Move Pull-Up up" }));
    await waitFor(() => {
      expect(transport.last("reorder_exercises").payload).toEqual({
        workoutExerciseIds: [pullUpOccurrence, squatOccurrence],
      });
    });
    const regions = screen.getAllByRole("region");
    expect(regions[0]).toHaveAccessibleName("Pull-Up");
  });

  it("replays pending outbox commands into the restored state", async () => {
    const outbox = new FakeOutbox();
    const transport = new FakeTransport();
    await outbox.enqueue({
      commandId: "00000000-0000-4000-8000-000000000c11",
      workoutId,
      expectedRevision: 4,
      operation: "set_workout_exercise_note",
      payload: { workoutExerciseId: squatOccurrence, note: "Pending note" },
      clientCreatedAt: "2026-09-04T10:20:00.000Z",
    });

    render(
      <ActiveWorkoutExperience
        initial={makeWorkout()}
        exercises={library}
        outbox={outbox}
        transport={transport}
      />,
    );

    expect(await screen.findByDisplayValue("Pending note")).toBeVisible();
    expect(screen.queryByLabelText("Restored workout")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(transport.last("set_workout_exercise_note").payload).toMatchObject(
        { note: "Pending note" },
      );
    });
  });
});

describe("Finish review", () => {
  it("shows split review metrics with the empty planned sets detail", async () => {
    const outbox = new FakeOutbox();
    const transport = new FakeTransport();
    render(
      <FinishReview
        initial={makeWorkout()}
        outbox={outbox}
        transport={transport}
      />,
    );

    expect(screen.getByText("Proposed split · active rotation")).toBeVisible();
    expect(screen.getByText("Exercises")).toBeVisible();
    expect(screen.getByText("Confirmed sets")).toBeVisible();
    expect(screen.getByText("Empty planned sets")).toBeVisible();
    expect(
      screen.getByText(
        "Planned but unconfirmed. These are not saved as performances:",
      ),
    ).toBeVisible();
    expect(screen.getByText("Squat set 2")).toBeVisible();
    expect(screen.getByText("Squat set 3")).toBeVisible();
    expect(screen.getByText("Pull-Up set 1")).toBeVisible();
    expect(
      screen.getByText(
        "Rotation advances to the next split, because this was the proposed split.",
      ),
    ).toBeVisible();
  });

  it("completes the workout and returns to Today", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport();
    render(
      <FinishReview
        initial={makeWorkout()}
        outbox={new FakeOutbox()}
        transport={transport}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Complete Workout" }));
    await waitFor(() => {
      expect(transport.last("finish_workout").payload).toMatchObject({
        outcome: "completed",
      });
    });
    await waitFor(() => {
      expect(actions.replace).toHaveBeenCalledWith("/today");
    });
  });

  it("omits the planned-set metric for one-time workouts and gates discard", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport();
    const oneTime = makeWorkout({
      sourceKind: "one_time",
      name: "Hotel Session",
      exercises: makeWorkout().exercises.map((exercise) => ({
        ...exercise,
        plannedSets: null,
        minReps: null,
        maxReps: null,
      })),
    });
    render(
      <FinishReview
        initial={oneTime}
        outbox={new FakeOutbox()}
        transport={transport}
      />,
    );

    expect(screen.getByText("One-time workout · no split")).toBeVisible();
    expect(screen.queryByText("Empty planned sets")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "No planned-set metric: this workout has no prescription, so its set rows are workout-local rather than planned.",
      ),
    ).toBeVisible();

    const finishActions = within(
      screen.getByRole("group", { name: "Finish actions" }),
    );
    expect(
      finishActions.getByRole("button", { name: "Complete Workout" }),
    ).toBeVisible();
    expect(
      finishActions.getByRole("button", { name: "Discard Workout" }),
    ).toBeVisible();

    await user.click(
      finishActions.getByRole("button", { name: "Discard Workout" }),
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Discard this workout?",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Discard Workout" }),
    );
    await waitFor(() => {
      expect(transport.last("finish_workout").payload).toMatchObject({
        outcome: "discarded",
      });
    });
    await waitFor(() => {
      expect(actions.replace).toHaveBeenCalledWith("/today");
    });
  });
});
