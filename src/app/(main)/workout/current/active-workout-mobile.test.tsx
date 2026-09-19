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

import { MainShell } from "@/shared/ui";

import { ActiveWorkoutExperience } from "./active-workout-experience";
import { FinishReview } from "./finish/finish-review";

const actions = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  getCurrent: vi.fn(),
  listExercises: vi.fn(),
}));
const scrollIntoView = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: actions.push,
    replace: actions.replace,
    refresh: actions.refresh,
  }),
  usePathname: () => "/workout/current",
}));
vi.mock("@/app/actions/workouts", () => ({
  getCurrentWorkoutAction: actions.getCurrent,
}));
vi.mock("@/app/actions/exercises", () => ({
  listExercisesAction: actions.listExercises,
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
  /** Refuses the first command it matches, then behaves normally. */
  rejectOnce?: (command: ActiveWorkoutCommand) => boolean;

  async deliver(
    command: ActiveWorkoutCommand,
  ): Promise<ActiveWorkoutCommandResult> {
    this.commands.push(command);
    if (this.rejectOnce?.(command) === true) {
      this.rejectOnce = undefined;
      return {
        kind: "rejected",
        code: "validation",
        message: "That change is not valid for this workout.",
      };
    }
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
        measurementType: "reps",
        allowedLoadModes: ["weight", "weight_resistance_band"],
        persistentNote: "Brace before unracking.",
        plannedSets: 3,
        minReps: 5,
        maxReps: 8,
        workoutNote: "",
        previousWorkoutNote: {
          workoutDate: "2026-08-22",
          note: "Knee hurt near the bottom.",
        },
        sets: [
          makeSet({
            id: "00000000-0000-4000-8000-0000000000d1",
            position: 1,
            loadMode: "weight",
            loadKg: 82.5,
            reps: 6,
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

function renderExperience(
  workout = makeWorkout(),
  transport = new FakeTransport(),
) {
  const outbox = new FakeOutbox();
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
  Element.prototype.scrollIntoView = scrollIntoView;
  window.sessionStorage.clear();
  actions.getCurrent.mockResolvedValue({
    ok: false,
    error: {
      code: "persistence",
      message: "Unavailable in this test.",
      retryable: true,
    },
  });
  actions.listExercises.mockResolvedValue({ ok: true, value: library });
});

afterEach(cleanup);

describe("Active-workout queue", () => {
  it("opens on the first set without values and names what it belongs to", async () => {
    renderExperience();

    // Squat set 1 already holds values, so the queue starts on set 2.
    expect(await screen.findByRole("heading", { name: "Squat" })).toBeVisible();
    expect(screen.getByText(/Set 2 of 3/)).toBeVisible();
    expect(screen.getByText(/3 × 5–8 planned/)).toBeVisible();
    // The wheels start from the set before this one.
    expect(screen.getByText("82.5")).toBeVisible();
    expect(screen.getByLabelText("Active duration")).toHaveTextContent("5:00");
    expect(
      screen.getByText("Squat · set 3 of 3", { exact: false }),
    ).toBeVisible();
  });

  it("carries the snapshotted note and the previous performance", async () => {
    const user = userEvent.setup();
    renderExperience();

    await user.click(screen.getByRole("button", { name: /Note/ }));
    expect(screen.getByText("Brace before unracking.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await user.click(screen.getByRole("button", { name: /Last/ }));
    expect(screen.getByText(/6 x 85 kg/)).toBeVisible();
  });

  it("keeps primary navigation available during the workout", () => {
    render(
      <MainShell>
        <ActiveWorkoutExperience
          initial={makeWorkout()}
          exercises={library}
          outbox={new FakeOutbox()}
          transport={new FakeTransport()}
        />
      </MainShell>,
    );

    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(nav.getByRole("link", { name: "Today" })).toBeVisible();
    expect(nav.getByRole("link", { name: "History" })).toBeVisible();
  });

  it("loads the exercise library only when Add exercise opens", async () => {
    const user = userEvent.setup();
    renderExperience(makeWorkout({ exercises: [] }));

    expect(actions.listExercises).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Add exercise" }));
    expect(
      await screen.findByRole("button", { name: /Face Pull/ }),
    ).toBeVisible();
  });

  it("records a set from the wheels with no confirmation step", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    // Turning the reps wheel one notch up from the seeded 6.
    await user.click(screen.getByRole("button", { name: "Reps 7" }));
    await user.click(screen.getByRole("button", { name: "Log this set" }));

    const command = transport.last("update_set");
    expect(command.payload).toMatchObject({
      workoutSetId: "00000000-0000-4000-8000-0000000000d2",
      loadMode: "weight",
      loadKg: 82.5,
      reps: 7,
    });
  });

  it("refuses to log a set the mode cannot complete", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience(
      makeWorkout({
        exercises: [
          {
            ...makeWorkout().exercises[0]!,
            sets: [
              makeSet({
                id: "00000000-0000-4000-8000-0000000000d2",
                position: 1,
                loadMode: "weight_resistance_band",
              }),
            ],
            lastPerformance: null,
          },
        ],
      }),
    );

    await user.click(screen.getByRole("button", { name: "Log this set" }));
    expect(screen.getByRole("status")).toHaveTextContent(/band strength/);
    expect(transport.commands).toHaveLength(0);
  });

  it("applies and removes the definition's addition from the current set", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("button", { name: /resistance band/i }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(transport.last("update_set").payload).toMatchObject({
      workoutSetId: "00000000-0000-4000-8000-0000000000d2",
      loadMode: "weight_resistance_band",
      bandDirection: "resistance",
    });
  });

  it("jumps to any set through the progress segments", async () => {
    const user = userEvent.setup();
    renderExperience();

    await user.click(screen.getByRole("button", { name: "Pull-Up set 1" }));
    expect(
      await screen.findByRole("heading", { name: "Pull-Up" }),
    ).toBeVisible();
    expect(screen.getByText(/Set 1 of 2/)).toBeVisible();
  });

  it("opens the finish review locally from the round check action", async () => {
    const user = userEvent.setup();
    renderExperience();

    await user.click(
      screen.getByRole("button", { name: "Review and finish workout" }),
    );
    const panel = screen.getByRole("dialog", { name: "Review & finish" });
    expect(within(panel).getByText("Sets")).toBeVisible();
    expect(
      within(panel).getByText(/3 planned sets left without values/),
    ).toBeVisible();
    expect(actions.getCurrent).not.toHaveBeenCalled();
  });

  it("gates populated removals behind confirmation and removes empty rows directly", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    // Set 2 holds nothing, so it goes without a question.
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("button", { name: "Remove this set" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(transport.last("remove_set").payload).toMatchObject({
      confirmedPopulatedRemoval: false,
    });

    // The exercise holds a recorded set, so removing it asks first.
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(
      screen.getByRole("button", { name: "Remove this exercise" }),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Remove" }));
    expect(transport.last("remove_exercise").payload).toMatchObject({
      confirmedPopulatedRemoval: true,
    });
  });

  it("pauses and resumes the timer with non-color state cues", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await user.click(
      screen.getByRole("button", { name: "Pause — continue later" }),
    );
    expect(transport.last("pause_timer")).toBeTruthy();
    expect(
      await screen.findByText(/active duration is not counting/),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Resume timer" })).toBeVisible();
  });

  it("reorders exercises by holding a card and enqueues the full order", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await user.click(screen.getByRole("button", { name: "Workout overview" }));
    screen.getByRole("region", { name: "Squat" }).focus();
    await user.keyboard("{ArrowDown}");

    expect(transport.last("reorder_exercises").payload).toEqual({
      workoutExerciseIds: [pullUpOccurrence, squatOccurrence],
    });
  });

  it("undoes a permanently rejected change and keeps the workout usable", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport();
    transport.rejectOnce = (command) => command.operation === "update_set";
    actions.getCurrent.mockResolvedValue({ ok: true, value: makeWorkout() });
    renderExperience(makeWorkout(), transport);

    await user.click(screen.getByRole("button", { name: "Log this set" }));

    await waitFor(() => expect(actions.getCurrent).toHaveBeenCalled());
    expect(await screen.findByRole("heading", { name: "Squat" })).toBeVisible();
  });

  it("replays pending outbox commands into the restored state", async () => {
    const outbox = new FakeOutbox();
    await outbox.enqueue({
      commandId: "00000000-0000-4000-8000-0000000000c1",
      workoutId,
      expectedRevision: 4,
      operation: "update_set",
      payload: {
        workoutSetId: "00000000-0000-4000-8000-0000000000d2",
        loadMode: "weight",
        loadKg: 90,
        bandDirection: null,
        bandStrength: null,
        reps: 5,
      },
      clientCreatedAt: "2026-09-04T10:05:00.000Z",
    } as ActiveWorkoutCommand);

    render(
      <ActiveWorkoutExperience
        initial={makeWorkout()}
        exercises={library}
        outbox={outbox}
        transport={new FakeTransport()}
      />,
    );

    // The replayed command completes set 2, so the queue moves to set 3.
    expect(await screen.findByText(/Set 3 of 3/)).toBeVisible();
  });
});

describe("Finish review", () => {
  it("shows split review metrics and names the sets left without values", async () => {
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
    expect(screen.getByText("Recorded sets")).toBeVisible();
    expect(screen.getByText("Sets left without values")).toBeVisible();
    expect(
      screen.getByText(
        "Planned but left without values. These are not saved as performances:",
      ),
    ).toBeVisible();
    expect(screen.getByText("Squat set 2")).toBeVisible();
    expect(screen.getByText("Squat set 3")).toBeVisible();
    expect(screen.getByText("Pull-Up set 2")).toBeVisible();
    // Pull-Up set 1 holds its added weight and reps, so it is recorded.
    expect(screen.queryByText("Pull-Up set 1")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Rotation advances to the next split, because this was the proposed split.",
      ),
    ).toBeVisible();
    // ADR-0027 removed set confirmation, so the explanation says recorded.
    expect(
      screen.getByText(
        "Recorded sets count toward exercise personal records and charts.",
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
    expect(
      screen.queryByText("Sets left without values"),
    ).not.toBeInTheDocument();
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
