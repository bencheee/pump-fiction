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
  WorkoutExercise,
  WorkoutSet,
} from "@/features/active-workout/domain/workout";
import type { Exercise } from "@/features/exercises/domain/exercise";

import { MainShell } from "@/shared/ui";

import { ActiveWorkoutExperience } from "./active-workout-experience";

/*
 * The active workout as the redesign draws it (docs/design/redesign-v2/PLAN.md,
 * steps 4–7): a set queue with value wheels, a workout overview, the panels the
 * queue opens, and the interstitials the primary action raises. The finish
 * review is a panel over the queue since step 6, so `FinishReview` and its
 * route are gone and the review is driven from here.
 */

const actions = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  getCurrent: vi.fn(),
  listExercises: vi.fn(),
}));

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
const facePullOccurrence = "00000000-0000-4000-8000-00000000000e";
const squatSet2 = "00000000-0000-4000-8000-0000000000d2";

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

type Failure = Readonly<{
  match: (command: ActiveWorkoutCommand) => boolean;
  result: (command: ActiveWorkoutCommand) => ActiveWorkoutCommandResult;
}>;

class FakeTransport implements ActiveWorkoutCommandTransport {
  commands: ActiveWorkoutCommand[] = [];
  private failures: Failure[] = [];
  private gate?: Promise<void>;

  /** Answers the first matching delivery with `result`, then behaves normally. */
  failOnce(match: Failure["match"], result: Failure["result"]): FakeTransport {
    this.failures.push({ match, result });
    return this;
  }

  /** Refuses the first command it matches for good, then behaves normally. */
  rejectOnce(match: Failure["match"]): FakeTransport {
    return this.failOnce(match, () => ({
      kind: "rejected",
      code: "validation",
      message: "That change is not valid for this workout.",
    }));
  }

  /** Holds every delivery until the returned release is called. */
  hold(): () => void {
    let release = () => {};
    this.gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    return () => {
      this.gate = undefined;
      release();
    };
  }

  async deliver(
    command: ActiveWorkoutCommand,
  ): Promise<ActiveWorkoutCommandResult> {
    this.commands.push(command);
    if (this.gate !== undefined) await this.gate;
    const failure = this.failures.findIndex((entry) => entry.match(command));
    if (failure >= 0) {
      const [entry] = this.failures.splice(failure, 1);
      return entry!.result(command);
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

  all(operation: ActiveWorkoutCommand["operation"]): ActiveWorkoutCommand[] {
    return this.commands.filter((command) => command.operation === operation);
  }

  last(operation: ActiveWorkoutCommand["operation"]): ActiveWorkoutCommand {
    const match = this.all(operation).at(-1);
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
          makeSet({ id: squatSet2, position: 2, loadMode: "weight" }),
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

/** A bodyweight exercise with nothing entered and nothing to carry over. */
function facePull(overrides?: Partial<WorkoutExercise>): WorkoutExercise {
  return {
    id: facePullOccurrence,
    exerciseId: "00000000-0000-4000-8000-0000000000f3",
    position: 3,
    exerciseName: "Face Pull",
    exerciseBaseType: "bodyweight",
    allowedLoadModes: ["bodyweight", "bodyweight_resistance_band"],
    persistentNote: "",
    plannedSets: 2,
    minReps: 10,
    maxReps: 15,
    workoutNote: "",
    sets: [
      makeSet({
        id: "00000000-0000-4000-8000-0000000000c1",
        position: 1,
        loadMode: "bodyweight",
      }),
      makeSet({
        id: "00000000-0000-4000-8000-0000000000c2",
        position: 2,
        loadMode: "bodyweight",
      }),
    ],
    lastPerformance: null,
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

function renderExperience({
  workout = makeWorkout(),
  transport = new FakeTransport(),
  outbox = new FakeOutbox(),
  exercises = library,
  initialView,
  initialPanel,
}: {
  workout?: CurrentWorkout;
  transport?: FakeTransport;
  outbox?: FakeOutbox;
  /** null renders the routed screen, which loads the library lazily. */
  exercises?: readonly Exercise[] | null;
  initialView?: "queue" | "overview";
  initialPanel?: "finish";
} = {}) {
  render(
    <MainShell>
      <ActiveWorkoutExperience
        initial={workout}
        serverNow={Date.now()}
        initialView={initialView}
        initialPanel={initialPanel}
        exercises={exercises ?? undefined}
        outbox={outbox}
        transport={transport}
      />
    </MainShell>,
  );
  return { outbox, transport };
}

type User = ReturnType<typeof userEvent.setup>;

function wheel(label: "Load" | "Reps"): HTMLElement {
  return screen.getByRole("group", { name: label });
}

function wheelValue(label: "Load" | "Reps"): HTMLElement {
  return wheel(label).querySelector<HTMLElement>("[data-wheel-value]")!;
}

async function pressCandidate(
  user: User,
  label: "Load" | "Reps",
  value: string,
): Promise<void> {
  await user.click(within(wheel(label)).getByRole("button", { name: value }));
}

function segment(name: string | RegExp): HTMLElement {
  return screen.getByRole("button", { name });
}

function currentExercise(): HTMLElement {
  return screen.getByRole("heading", { level: 2 });
}

async function openActions(user: User): Promise<HTMLElement> {
  await user.click(screen.getByRole("button", { name: "More actions" }));
  return screen.findByRole("dialog", { name: "Actions" });
}

function actionLabels(panel: HTMLElement): string[] {
  return Array.from(panel.querySelectorAll("[data-actions-item]")).map(
    (item) => item.getAttribute("aria-label") ?? "",
  );
}

/** Picks an entry on the Actions panel and runs it with Continue. */
async function runAction(user: User, label: string): Promise<void> {
  const panel = await openActions(user);
  await user.click(within(panel).getByRole("button", { name: label }));
  await user.click(within(panel).getByRole("button", { name: "Continue" }));
  await waitFor(() => {
    expect(
      screen.queryByRole("dialog", { name: "Actions" }),
    ).not.toBeInTheDocument();
  });
}

async function openReview(user: User): Promise<HTMLElement> {
  await user.click(
    screen.getByRole("button", { name: "Review and finish workout" }),
  );
  return screen.findByRole("dialog", { name: "Review & finish" });
}

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/workout/current");
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

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Active set queue", () => {
  it("opens on the first set still without values, with its snapshot, prescription and mode", async () => {
    const user = userEvent.setup();
    renderExperience();

    // MVP-WRK-001/002: the snapshot's name and prescription, and exactly the
    // planned set rows, one segment each.
    expect(currentExercise()).toHaveTextContent("Squat");
    expect(screen.getByText("Set 2 of 3 · 3 × 5–8 planned")).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: /^(Squat|Pull-Up) set \d$/ }),
    ).toHaveLength(5);
    expect(segment("Squat set 1")).toHaveAttribute("data-state", "recorded");
    expect(segment("Squat set 2")).toHaveAttribute("data-state", "current");
    expect(segment("Squat set 3")).toHaveAttribute("data-state", "pending");
    // Pull-Up set 1 holds its added weight and reps, so it is recorded.
    expect(segment("Pull-Up set 1")).toHaveAttribute("data-state", "recorded");
    expect(segment("Pull-Up set 2")).toHaveAttribute("data-state", "pending");
    expect(screen.getByText("Up next")).toBeVisible();
    expect(screen.getByText("Set 3 of 3 · Squat")).toBeVisible();

    // MVP-WRK-003: only the fields of the set's own mode. A weight set has a
    // kilogram wheel and a reps wheel, and no band.
    expect(wheel("Load")).toBeVisible();
    expect(wheel("Reps")).toBeVisible();
    expect(screen.queryByText("Resistance band")).not.toBeInTheDocument();
    // The empty set offers the numbers of the set before it (Owner,
    // 2026-09-21, PLAN step 6), and says it is an offer.
    expect(wheelValue("Load")).toHaveTextContent(/^82\.5kg, suggested$/);
    expect(wheelValue("Reps")).toHaveTextContent(/^6reps, suggested$/);
    // ADR-0027: no screen offers a confirmation control.
    expect(
      screen.queryByRole("button", { name: /Confirm/ }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText("All changes saved")).toBeInTheDocument();

    // An added weight shows its own unit; a plain bodyweight set shows the
    // Bodyweight pill in place of a load.
    await user.click(segment("Pull-Up set 1"));
    expect(currentExercise()).toHaveTextContent("Pull-Up");
    expect(wheelValue("Load")).toHaveTextContent(/^5\+kg$/);
    expect(wheelValue("Reps")).toHaveTextContent(/^8reps$/);

    await user.click(segment("Pull-Up set 2"));
    expect(screen.getByText("Bodyweight")).toBeVisible();
    expect(
      screen.queryByRole("group", { name: "Load" }),
    ).not.toBeInTheDocument();
    // The load does not carry from an added weight to a bodyweight set; the
    // repetitions do.
    expect(wheelValue("Reps")).toHaveTextContent(/^8reps, suggested$/);
  });

  it("shows the persistent note and the note carried from the last workout", async () => {
    const user = userEvent.setup();
    renderExperience();

    await user.click(screen.getByRole("button", { name: "Exercise note" }));
    const note = await screen.findByRole("dialog", { name: "Note" });
    expect(within(note).getByText("Brace before unracking.")).toBeVisible();
    expect(
      within(note).getByText(
        "Note from last workout · 22 Aug: Knee hurt near the bottom.",
      ),
    ).toBeVisible();

    await user.click(within(note).getByRole("button", { name: "Back to set" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Note" }),
      ).not.toBeInTheDocument();
    });
    expect(currentExercise()).toHaveTextContent("Squat");
  });

  it("shows Last time with its date and one set per line (MVP-WRK-006)", async () => {
    const user = userEvent.setup();
    renderExperience();

    await user.click(
      screen.getByRole("button", { name: "Last time · 22 Aug" }),
    );
    const last = await screen.findByRole("dialog", { name: "Last time" });
    expect(within(last).getByText("Last time · 22 Aug")).toBeVisible();
    const rows = within(last).getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("185 kg6 reps");
    await user.click(within(last).getByRole("button", { name: "Back to set" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Last time" }),
      ).not.toBeInTheDocument();
    });

    // Copy is the prototype's (PLAN step 6): "No completed performance yet."
    // became the ledger's own sentence for an exercise never performed.
    await user.click(segment("Pull-Up set 2"));
    await user.click(
      screen.getByRole("button", { name: "No previous performance" }),
    );
    const none = await screen.findByRole("dialog", { name: "Last time" });
    expect(
      within(none).getByText("No previous sets recorded for this exercise."),
    ).toBeVisible();
  });

  it("keeps primary navigation available during the workout", async () => {
    renderExperience();

    const navigation = within(
      screen.getByRole("navigation", { name: "Primary" }),
    );
    for (const destination of [
      "Today",
      "History",
      "Programs",
      "Exercises",
      "Body",
    ]) {
      expect(navigation.getByRole("link", { name: destination })).toBeVisible();
    }
    // The workout is Today's in the prototype, so Today stays lit (step 4).
    expect(navigation.getByRole("link", { name: "Today" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // The header the old screen asserted is the queue's own bar since step 4:
    // the pause control, the clock and the way to the overview.
    expect(screen.getByLabelText("Active duration")).toHaveTextContent("5:00");
    expect(
      screen.getByRole("button", { name: "Pause — continue later" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Workout overview" }),
    ).toBeVisible();
  });

  it("records a set from its entered values with no confirmation step", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await pressCandidate(user, "Load", "85");
    await waitFor(() => {
      expect(transport.last("update_set").payload).toEqual({
        workoutSetId: squatSet2,
        loadMode: "weight",
        loadKg: 85,
        bandDirection: null,
        bandStrength: null,
        reps: null,
      });
    });
    // Half a set is kept as entered and is not recorded.
    expect(segment("Squat set 2")).toHaveAttribute("data-state", "current");

    await pressCandidate(user, "Reps", "5");
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        workoutSetId: squatSet2,
        loadKg: 85,
        reps: 5,
      });
    });
    expect(transport.last("update_set").payload).not.toHaveProperty(
      "isConfirmed",
    );
    // MVP-WRK-004: holding everything its mode requires is what records it.
    expect(segment("Squat set 2")).toHaveAttribute("data-state", "recorded");
    expect(wheelValue("Load")).toHaveTextContent(/^85kg$/);
    // Entering the last value does not move the screen off the set.
    expect(screen.getByText("Set 2 of 3 · 3 × 5–8 planned")).toBeVisible();
  });

  it("commits one change per drag, when the finger lifts", async () => {
    const { transport } = renderExperience();
    await screen.findByText("All changes saved");

    const reps = wheel("Reps");
    fireEvent.pointerDown(reps, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(reps, { clientY: 131, pointerId: 1 });
    fireEvent.pointerMove(reps, { clientY: 161, pointerId: 1 });
    // 30px per step (PLAN step 12): two steps shown, nothing written yet.
    expect(wheelValue("Reps")).toHaveTextContent(/^4reps$/);
    expect(transport.all("update_set")).toHaveLength(0);

    fireEvent.pointerUp(reps, { clientY: 161, pointerId: 1 });
    await waitFor(() => {
      expect(transport.all("update_set")).toHaveLength(1);
    });
    expect(transport.last("update_set").payload).toMatchObject({
      workoutSetId: squatSet2,
      reps: 4,
    });
  });

  it("stores the load column's zero as no load", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await user.click(segment("Pull-Up set 1"));
    await pressCandidate(user, "Load", "0");
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        loadMode: "bodyweight_added_weight",
        loadKg: null,
        reps: 8,
      });
    });
    expect(wheelValue("Load")).toHaveTextContent(/^—\+kg$/);
  });

  it("keeps a recorded set recorded when one of its values changes", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await user.click(segment("Squat set 1"));
    await pressCandidate(user, "Load", "80");

    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        loadKg: 80,
        reps: 6,
      });
    });
    expect(segment("Squat set 1")).toHaveAttribute("data-state", "recorded");
  });

  it("removes the definition's addition from a set and keeps its reps", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();
    await user.click(segment("Pull-Up set 1"));

    // MVP-WRK-003: exactly the one addition the definition permits, and no
    // menu of modes. Add set is offered on an exercise's last set only.
    const panel = await openActions(user);
    expect(within(panel).getByText("Set 1 of 2 · BW + 5 kg × 8")).toBeVisible();
    expect(actionLabels(panel)).toEqual([
      "Remove added weight",
      "Add today's note",
      "Remove this set",
      "Remove this exercise",
    ]);
    expect(
      within(panel).queryByRole("button", { name: /Change load mode/ }),
    ).not.toBeInTheDocument();
    // Continue runs nothing until an entry is picked.
    expect(
      within(panel).getByRole("button", { name: "Continue" }),
    ).toBeDisabled();
    await user.click(within(panel).getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Actions" }),
      ).not.toBeInTheDocument();
    });

    await runAction(user, "Remove added weight");
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        loadMode: "bodyweight",
        loadKg: null,
        reps: 8,
      });
    });
    // The old screen also wrote "Cleared added kg." beside the row. The
    // redesigned queue has nowhere that draws a row notice, so that sentence
    // is no longer shown; the set itself says what changed.
    expect(screen.getByText("Bodyweight")).toBeVisible();
    expect(wheelValue("Reps")).toHaveTextContent(/^8reps$/);
    expect(actionLabels(await openActions(user))).toContain("Add weight");
  });

  it("applies the definition's single addition to one set only", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await runAction(user, "Add resistance band");
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        workoutSetId: squatSet2,
        loadMode: "weight_resistance_band",
        bandDirection: "resistance",
      });
    });
    expect(screen.getByText("Resistance band")).toBeVisible();
    expect(wheel("Load")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Medium" }));
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        workoutSetId: squatSet2,
        bandStrength: "medium",
      });
    });
    expect(screen.getByRole("button", { name: "Medium" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(segment("Squat set 3"));
    expect(screen.queryByText("Resistance band")).not.toBeInTheDocument();

    await user.click(segment("Squat set 2"));
    await user.click(screen.getByRole("button", { name: "Remove band" }));
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        workoutSetId: squatSet2,
        loadMode: "weight",
        bandDirection: null,
        bandStrength: null,
      });
    });
    expect(screen.queryByText("Resistance band")).not.toBeInTheDocument();
  });

  it("gates populated removals behind confirmation and removes empty rows directly", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    // MVP-WRK-009: a populated set asks first, and Cancel keeps it.
    await user.click(segment("Pull-Up set 1"));
    await runAction(user, "Remove this set");
    let dialog = await screen.findByRole("alertdialog", {
      name: "Remove set 1 of Pull-Up?",
    });
    expect(
      within(dialog).getByText(
        "Its entered values are discarded. The source split is unchanged.",
      ),
    ).toBeVisible();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(transport.all("remove_set")).toHaveLength(0);

    await runAction(user, "Remove this set");
    dialog = await screen.findByRole("alertdialog", {
      name: "Remove set 1 of Pull-Up?",
    });
    await user.click(within(dialog).getByRole("button", { name: "Remove" }));
    await waitFor(() => {
      expect(transport.last("remove_set").payload).toEqual({
        workoutSetId: "00000000-0000-4000-8000-0000000000e1",
        confirmedPopulatedRemoval: true,
      });
    });

    // An empty set goes at once.
    await user.click(segment("Squat set 3"));
    await runAction(user, "Remove this set");
    await waitFor(() => {
      expect(transport.last("remove_set").payload).toEqual({
        workoutSetId: "00000000-0000-4000-8000-0000000000d3",
        confirmedPopulatedRemoval: false,
      });
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    // The one set an exercise has left cannot be removed.
    await user.click(segment(/^Pull-Up set/));
    const panel = await openActions(user);
    expect(
      within(panel).getByRole("button", { name: "Remove this set" }),
    ).toBeDisabled();
    await user.click(
      within(panel).getByRole("button", { name: "Remove this exercise" }),
    );
    await user.click(within(panel).getByRole("button", { name: "Continue" }));
    // Pull-Up still holds no values after its populated set went.
    await waitFor(() => {
      expect(transport.last("remove_exercise").payload).toEqual({
        workoutExerciseId: pullUpOccurrence,
        confirmedPopulatedRemoval: false,
      });
    });

    await runAction(user, "Remove this exercise");
    dialog = await screen.findByRole("alertdialog", {
      name: "Remove Squat from this workout?",
    });
    await user.click(within(dialog).getByRole("button", { name: "Remove" }));
    await waitFor(() => {
      expect(transport.last("remove_exercise").payload).toEqual({
        workoutExerciseId: squatOccurrence,
        confirmedPopulatedRemoval: true,
      });
    });
  });

  it("adds a set from the exercise's last set only", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    expect(actionLabels(await openActions(user))).not.toContain(
      "Add a set to this exercise",
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Actions" }),
      ).not.toBeInTheDocument();
    });

    await user.click(segment("Squat set 3"));
    await runAction(user, "Add a set to this exercise");
    await waitFor(() => {
      expect(transport.last("add_set").payload).toEqual({
        workoutExerciseId: squatOccurrence,
      });
    });
    expect(await screen.findByText("Set added.")).toBeVisible();
    expect(screen.getByText(/^Set 3 of 4/)).toBeVisible();
  });

  it("saves today's note for this occurrence from the Actions panel (MVP-WRK-007)", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await runAction(user, "Add today's note");
    const draft = await screen.findByRole("dialog", { name: "Today's note" });
    expect(
      within(draft).getByText("Saved with this workout only."),
    ).toBeVisible();
    await user.type(
      within(draft).getByRole("textbox", { name: "Today's note" }),
      "Felt strong",
    );
    await user.click(within(draft).getByRole("button", { name: "Save note" }));

    await waitFor(() => {
      expect(transport.last("set_workout_exercise_note").payload).toEqual({
        workoutExerciseId: squatOccurrence,
        note: "Felt strong",
      });
    });
    expect(
      await screen.findByText("Note saved with this workout."),
    ).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Today's note" }),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Exercise note" }));
    const note = await screen.findByRole("dialog", { name: "Note" });
    expect(
      within(note).getByText("Brace before unracking. · Today: Felt strong"),
    ).toBeVisible();
  });

  it("pauses and resumes the timer with non-color state cues", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    await user.click(
      screen.getByRole("button", { name: "Pause — continue later" }),
    );
    expect(
      await screen.findByText("Paused — active duration is not counting."),
    ).toBeVisible();
    await waitFor(() => {
      expect(transport.last("pause_timer")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Resume timer" }));
    await waitFor(() => {
      expect(transport.last("resume_timer")).toBeDefined();
    });
    expect(
      screen.queryByText("Paused — active duration is not counting."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pause — continue later" }),
    ).toBeVisible();
  });

  it("points an exercise with no sets at the overview", async () => {
    const user = userEvent.setup();
    renderExperience({
      workout: makeWorkout({ exercises: [facePull({ sets: [] })] }),
    });

    expect(currentExercise()).toHaveTextContent("Add a set to begin");
    expect(
      screen.getByText("No exercise in this workout has a set yet."),
    ).toBeVisible();
    // The bar's round button and the empty state's own pill both lead there.
    const pill = screen
      .getAllByRole("button", { name: "Workout overview" })
      .find((button) => button.textContent === "Workout overview");
    expect(pill).toBeDefined();
    await user.click(pill!);
    expect(
      screen.getByRole("region", { name: "Face Pull, position 1 of 1" }),
    ).toBeVisible();
  });

  it("lets an empty workout add an exercise, landing on the overview, or reach the review", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience({
      workout: makeWorkout({ exercises: [] }),
    });

    expect(currentExercise()).toHaveTextContent("Add an exercise to begin");
    expect(
      screen.getByText("This workout has no exercises yet."),
    ).toBeVisible();

    // The empty queue's own way to finish or discard (PLAN step 6).
    const review = await openReview(user);
    expect(
      within(review).getByRole("button", { name: "Discard workout" }),
    ).toBeVisible();
    await user.click(
      within(review).getByRole("button", { name: "Continue workout" }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Review & finish" }),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Add exercise" }));
    const picker = await screen.findByRole("dialog", { name: "Add exercise" });
    await user.click(within(picker).getByRole("button", { name: "Face Pull" }));
    await user.click(
      within(picker).getByRole("button", { name: "Add selected" }),
    );

    await waitFor(() => {
      expect(transport.last("add_exercise").payload).toEqual({
        exerciseId: "00000000-0000-4000-8000-0000000000f3",
      });
    });
    // `addPicked` lands on the overview when the workout had nothing in it.
    expect(await screen.findByText(/^1 exercise · 0 sets$/)).toBeVisible();
  });
});

describe("Logging a set", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  function timedUser(): User {
    return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  }

  async function afterFlash(): Promise<void> {
    await act(() => vi.advanceTimersByTimeAsync(2300));
  }

  it("writes the offered values with the press, then hands over and completes", async () => {
    const user = timedUser();
    const { transport } = renderExperience();

    await user.click(screen.getByRole("button", { name: "Log this set" }));
    // The fill goes out with the press, not at the end of the flash (step 7).
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        workoutSetId: squatSet2,
        loadMode: "weight",
        loadKg: 82.5,
        reps: 6,
      });
    });
    expect(segment("Squat set 2")).toHaveAttribute("data-state", "recorded");
    expect(screen.getByText("Set 2 of 3 · 3 × 5–8 planned")).toBeVisible();

    await afterFlash();
    expect(screen.getByText("Set 3 of 3 · 3 × 5–8 planned")).toBeVisible();

    // The last set of an exercise hands over to the next one with sets left.
    await user.click(screen.getByRole("button", { name: "Log this set" }));
    await afterFlash();
    const handoff = await screen.findByRole("dialog", { name: "Squat" });
    expect(within(handoff).getByText("Exercise done")).toBeVisible();
    expect(
      within(handoff).getByText("3 sets recorded · planned 3 × 5–8"),
    ).toBeVisible();
    expect(within(handoff).getAllByText("82.5 kg × 6")).toHaveLength(3);
    expect(within(handoff).getByText("Pull-Up")).toBeVisible();
    expect(
      within(handoff).getByText("Set 2 of 2 · 2 × 6–10 planned"),
    ).toBeVisible();
    await user.click(
      within(handoff).getByRole("button", {
        name: "Continue to next exercise",
      }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(currentExercise()).toHaveTextContent("Pull-Up");
    expect(screen.getByText("Set 2 of 2 · 2 × 6–10 planned")).toBeVisible();

    // The last set of the workout ends on the Workout complete screen.
    await user.click(screen.getByRole("button", { name: "Log this set" }));
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        workoutSetId: "00000000-0000-4000-8000-0000000000e2",
        loadMode: "bodyweight",
        loadKg: null,
        reps: 8,
      });
    });
    await afterFlash();
    const complete = await screen.findByRole("dialog", { name: "Lower Body" });
    expect(within(complete).getByText("All sets done")).toBeVisible();
    expect(within(complete).getByText("2 exercises")).toBeVisible();
    expect(within(complete).getByText("5 sets")).toBeVisible();
    expect(within(complete).getByText("Saved to History")).toBeVisible();
    expect(
      within(complete).getByText("Rotation advanced to the next split."),
    ).toBeVisible();

    await user.click(
      within(complete).getByRole("button", { name: "Back to Today" }),
    );
    await waitFor(() => {
      expect(transport.last("finish_workout").payload).toMatchObject({
        outcome: "completed",
      });
    });
    await waitFor(() => expect(actions.replace).toHaveBeenCalledWith("/today"));
    expect(
      await screen.findByText("Workout saved to History. Rotation advanced."),
    ).toBeVisible();
  });

  it("leaves a set with nothing to offer untouched, so the review still names it", async () => {
    const user = timedUser();
    const { transport } = renderExperience({
      workout: makeWorkout({ exercises: [facePull()] }),
    });
    await screen.findByText("All changes saved");

    expect(wheelValue("Reps")).toHaveTextContent(/^—reps$/);
    await user.click(screen.getByRole("button", { name: "Log this set" }));
    await afterFlash();

    expect(transport.all("update_set")).toHaveLength(0);
    expect(segment("Face Pull set 1")).toHaveAttribute("data-state", "pending");
    expect(screen.getByText("Set 2 of 2 · 2 × 10–15 planned")).toBeVisible();

    const review = await openReview(user);
    expect(
      within(review).getByText(/2 planned sets left without values/),
    ).toBeVisible();
    expect(within(review).getByText("Face Pull set 1")).toBeVisible();
  });
});

describe("Review & finish panel", () => {
  it("opens from the round check button over the local snapshot and names the sets left without values", async () => {
    const user = userEvent.setup();
    renderExperience();

    const review = await openReview(user);
    // MVP-WRK-011, from the client snapshot: nothing is read from the server.
    expect(actions.getCurrent).not.toHaveBeenCalled();
    expect(
      within(review).getByRole("heading", { name: "Lower Body" }),
    ).toBeVisible();
    const stats = within(review).getAllByRole("definition");
    expect(within(review).getByText("Duration")).toBeVisible();
    expect(stats[0]).toHaveTextContent("5:00");
    expect(within(review).getByText("Exercises")).toBeVisible();
    expect(stats[1]).toHaveTextContent("2");
    // "Recorded sets" is the prototype's "Sets" (PLAN step 6).
    expect(within(review).getByText("Sets")).toBeVisible();
    expect(stats[2]).toHaveTextContent("2");

    expect(
      within(review).getByText(/3 planned sets left without values/),
    ).toBeVisible();
    expect(
      within(review)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Squat set 2", "Squat set 3", "Pull-Up set 2"]);
    // Pull-Up set 1 holds its added weight and reps, so it is recorded.
    expect(within(review).queryByText("Pull-Up set 1")).not.toBeInTheDocument();
    // The old screen's source line, its "not saved as performances" lead, its
    // rotation sentence and its records-and-charts explanation are not in the
    // prototype's panel (PLAN step 6). The rotation rule is now said by the
    // finishing toast, asserted below and in the one-time test.

    await user.click(
      within(review).getByRole("button", { name: "Continue workout" }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Review & finish" }),
      ).not.toBeInTheDocument();
    });
    expect(currentExercise()).toHaveTextContent("Squat");
  });

  it("completes the workout once the terminal command has drained, then returns to Today", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport();
    renderExperience({ transport });
    await screen.findByText("All changes saved");

    const review = await openReview(user);
    const release = transport.hold();
    await user.click(
      within(review).getByRole("button", { name: "Complete workout" }),
    );

    // The finish is a command: the panel holds while it is delivered.
    await waitFor(() => {
      expect(
        within(review).getByRole("button", { name: "Complete workout" }),
      ).toBeDisabled();
    });
    expect(within(review).getByText("Finishing…")).toBeVisible();
    expect(
      within(review).getByRole("button", { name: "Discard workout" }),
    ).toBeDisabled();
    expect(screen.getByText("Saving…")).toBeInTheDocument();
    expect(transport.last("finish_workout").payload).toMatchObject({
      outcome: "completed",
    });
    // Built against the local snapshot's revision. The old assertion expected
    // the revision of a server read; the review never reads the server.
    expect(transport.last("finish_workout").expectedRevision).toBe(4);
    expect(actions.replace).not.toHaveBeenCalled();

    release();
    await waitFor(() => expect(actions.replace).toHaveBeenCalledWith("/today"));
    expect(
      await screen.findByText("Workout saved to History. Rotation advanced."),
    ).toBeVisible();
  });

  it("discards only after its own confirmation", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience();

    let review = await openReview(user);
    await user.click(
      within(review).getByRole("button", { name: "Discard workout" }),
    );
    let dialog = await screen.findByRole("alertdialog", {
      name: "Discard this workout?",
    });
    expect(
      within(dialog).getByText(
        "Its entered sets and notes are lost, no History record is created, and rotation is unchanged.",
      ),
    ).toBeVisible();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(transport.all("finish_workout")).toHaveLength(0);

    review = screen.getByRole("dialog", { name: "Review & finish" });
    await user.click(
      within(review).getByRole("button", { name: "Discard workout" }),
    );
    dialog = await screen.findByRole("alertdialog", {
      name: "Discard this workout?",
    });
    await user.click(within(dialog).getByRole("button", { name: "Discard" }));

    await waitFor(() => {
      expect(transport.last("finish_workout").payload).toMatchObject({
        outcome: "discarded",
      });
    });
    await waitFor(() => expect(actions.replace).toHaveBeenCalledWith("/today"));
    expect(
      await screen.findByText("Workout discarded. No History record created."),
    ).toBeVisible();
  });

  it("omits the planned-set metric for one-time workouts and leaves rotation unchanged", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience({
      workout: makeWorkout({
        sourceKind: "one_time",
        name: "Hotel Session",
        exercises: makeWorkout().exercises.map((exercise) => ({
          ...exercise,
          plannedSets: null,
          minReps: null,
          maxReps: null,
        })),
      }),
    });

    // No prescription, so the set chip carries no tail either.
    expect(screen.getByText("Set 2 of 3")).toBeVisible();

    const review = await openReview(user);
    expect(
      within(review).queryByText(/left without values/),
    ).not.toBeInTheDocument();
    expect(
      within(review).getByText(
        "A one-time workout has no prescription, so none of its sets can be left planned without values.",
      ),
    ).toBeVisible();
    // The three actions MVP-WRK-011 names. They were a named "Finish actions"
    // group; the prototype's panel draws them as a plain stack (step 6).
    for (const name of [
      "Complete workout",
      "Continue workout",
      "Discard workout",
    ]) {
      expect(within(review).getByRole("button", { name })).toBeVisible();
    }

    await user.click(
      within(review).getByRole("button", { name: "Complete workout" }),
    );
    await waitFor(() => {
      expect(transport.last("finish_workout").payload).toMatchObject({
        outcome: "completed",
      });
    });
    await waitFor(() => expect(actions.replace).toHaveBeenCalledWith("/today"));
    expect(
      await screen.findByText("Workout saved to History. Rotation unchanged."),
    ).toBeVisible();
  });

  it("opens from the completed primary once every set is recorded", async () => {
    const user = userEvent.setup();
    const recorded = makeWorkout();
    renderExperience({
      workout: makeWorkout({
        exercises: recorded.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => ({
            ...set,
            loadKg: set.loadMode === "bodyweight" ? null : 80,
            reps: 7,
          })),
        })),
      }),
    });

    const primary = screen
      .getAllByRole("button", { name: "Review and finish workout" })
      .find((button) => button.textContent === "Review & finish");
    expect(primary).toBeDefined();
    await user.click(primary!);
    const review = await screen.findByRole("dialog", {
      name: "Review & finish",
    });
    expect(
      within(review).queryByText(/left without values/),
    ).not.toBeInTheDocument();
  });

  it("opens over the queue from the finish deep link", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/workout/current?panel=finish");
    renderExperience({ initialPanel: "finish" });

    const review = await screen.findByRole("dialog", {
      name: "Review & finish",
    });
    // Closing lands on the workout, and a reload does not reopen the panel.
    expect(window.location.search).toBe("");
    await user.click(within(review).getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Review & finish" }),
      ).not.toBeInTheDocument();
    });
    expect(currentExercise()).toHaveTextContent("Squat");
    expect(window.location.pathname).toBe("/workout/current");
    expect(window.location.search).toBe("");
  });
});

describe("Workout overview", () => {
  it("lists the exercises with their prescription and progress, and resumes the queue", async () => {
    const user = userEvent.setup();
    renderExperience({ initialView: "overview" });

    expect(
      screen.getByRole("heading", { level: 1, name: "Lower Body" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Active duration")).toHaveTextContent("5:00");
    expect(screen.getByText("2 exercises · 5 sets")).toBeVisible();
    expect(
      within(
        screen.getByRole("region", { name: "Squat, position 1 of 2" }),
      ).getByText("3 × 5–8 · 1 of 3 recorded"),
    ).toBeVisible();
    expect(
      within(
        screen.getByRole("region", { name: "Pull-Up, position 2 of 2" }),
      ).getByText("2 × 6–10 · 1 of 2 recorded"),
    ).toBeVisible();
    expect(screen.getByText("2 of 5 sets recorded")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Resume current set" }),
    );
    expect(currentExercise()).toHaveTextContent("Squat");
    expect(screen.getByText("Set 2 of 3 · 3 × 5–8 planned")).toBeVisible();

    // Back returns to where the overview was opened from.
    await user.click(screen.getByRole("button", { name: "Workout overview" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(currentExercise()).toHaveTextContent("Squat");
    expect(actions.push).not.toHaveBeenCalled();
  });

  it("goes back to Today when a start landed on it", async () => {
    const user = userEvent.setup();
    renderExperience({ initialView: "overview" });

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(actions.push).toHaveBeenCalledWith("/today");
  });

  it("reorders exercises from the keyboard and enqueues the full order", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience({ initialView: "overview" });

    // The `Move X up` buttons went in step 5; a focused row moves with Alt and
    // an arrow instead.
    const pullUp = screen.getByRole("region", {
      name: "Pull-Up, position 2 of 2",
    });
    expect(pullUp).toHaveAccessibleDescription(
      "Hold an exercise to drag it, or press Alt with the up or down arrow to move it.",
    );
    pullUp.focus();
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(transport.all("reorder_exercises")).toHaveLength(0);

    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await waitFor(() => {
      expect(transport.last("reorder_exercises").payload).toEqual({
        workoutExerciseIds: [pullUpOccurrence, squatOccurrence],
      });
    });
    expect(
      screen.getByText("Pull-Up moved to position 1 of 2."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("region")[0]).toHaveAccessibleName(
      "Pull-Up, position 1 of 2",
    );
  });

  it("reorders exercises by holding a row and dragging it", async () => {
    const { transport } = renderExperience({ initialView: "overview" });
    const squat = screen.getByRole("region", {
      name: "Squat, position 1 of 2",
    });

    // A slip before the hold gives the press back to the scroll.
    fireEvent.pointerDown(squat, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(squat, { clientY: 120, pointerId: 1 });
    await act(() => new Promise((resolve) => setTimeout(resolve, 220)));
    fireEvent.pointerMove(squat, { clientY: 200, pointerId: 1 });
    fireEvent.pointerUp(squat, { pointerId: 1 });
    expect(transport.all("reorder_exercises")).toHaveLength(0);

    // Held still for 180ms, the row lifts and lands where it is let go.
    fireEvent.pointerDown(squat, { clientY: 100, pointerId: 2 });
    await act(() => new Promise((resolve) => setTimeout(resolve, 220)));
    expect(squat).toHaveAttribute("data-drag", "lifted");
    fireEvent.pointerMove(squat, { clientY: 200, pointerId: 2 });
    fireEvent.pointerUp(squat, { pointerId: 2 });

    await waitFor(() => {
      expect(transport.last("reorder_exercises").payload).toEqual({
        workoutExerciseIds: [pullUpOccurrence, squatOccurrence],
      });
    });
    expect(screen.getAllByRole("region")[0]).toHaveAccessibleName(
      "Pull-Up, position 1 of 2",
    );
  });

  it("gates a populated exercise's removal behind confirmation and removes an empty one directly", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience({
      initialView: "overview",
      workout: makeWorkout({
        exercises: [...makeWorkout().exercises, facePull()],
      }),
    });

    await user.click(screen.getByRole("button", { name: "Remove Face Pull" }));
    await waitFor(() => {
      expect(transport.last("remove_exercise").payload).toEqual({
        workoutExerciseId: facePullOccurrence,
        confirmedPopulatedRemoval: false,
      });
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove Squat" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Remove Squat from this workout?",
    });
    expect(
      within(dialog).getByText(
        "Entered sets are discarded. Your library and the source split are unchanged.",
      ),
    ).toBeVisible();
    await user.click(within(dialog).getByRole("button", { name: "Remove" }));
    await waitFor(() => {
      expect(transport.last("remove_exercise").payload).toEqual({
        workoutExerciseId: squatOccurrence,
        confirmedPopulatedRemoval: true,
      });
    });
  });

  it("adds a set to an exercise that has none", async () => {
    const user = userEvent.setup();
    const { transport } = renderExperience({
      initialView: "overview",
      workout: makeWorkout({
        exercises: [...makeWorkout().exercises, facePull({ sets: [] })],
      }),
    });

    expect(
      screen.queryByRole("button", { name: "Add a set to Squat" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Add a set to Face Pull" }),
    );
    await waitFor(() => {
      expect(transport.last("add_set").payload).toEqual({
        workoutExerciseId: facePullOccurrence,
      });
    });
  });

  it("loads the library only when Add exercise opens, and shows the addition until the server has it", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport();
    const withFacePull = makeWorkout({
      revision: 5,
      exercises: [...makeWorkout().exercises, facePull({ sets: [] })],
    });
    // The server has the exercise only once the command has been delivered.
    actions.getCurrent.mockResolvedValue({ ok: true, value: makeWorkout() });
    renderExperience({ transport, exercises: null, initialView: "overview" });

    expect(actions.listExercises).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Add exercise" }));
    await waitFor(() => expect(actions.listExercises).toHaveBeenCalledOnce());
    const picker = await screen.findByRole("dialog", { name: "Add exercise" });
    const option = await within(picker).findByRole("button", {
      name: "Face Pull",
    });
    expect(
      within(picker).getByRole("button", { name: "Add selected" }),
    ).toBeDisabled();
    await user.click(option);
    expect(option).toHaveAttribute("aria-pressed", "true");

    const release = transport.hold();
    await user.click(
      within(picker).getByRole("button", { name: "Add selected" }),
    );
    expect(
      await screen.findByText("1 exercise added to this workout."),
    ).toBeVisible();

    // The placeholder row carries the name it was added under and no control.
    const arriving = await screen.findByText("Adding to this workout…");
    expect(arriving).toHaveAttribute("role", "status");
    const row = arriving.closest<HTMLElement>("[data-overview-row]")!;
    expect(within(row).getByText("Face Pull")).toBeVisible();
    expect(within(row).queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove Face Pull" }),
    ).not.toBeInTheDocument();
    expect(transport.last("add_exercise").payload).toEqual({
      exerciseId: "00000000-0000-4000-8000-0000000000f3",
    });

    // Once the queue drains, the server's row replaces the placeholder.
    actions.getCurrent.mockResolvedValue({ ok: true, value: withFacePull });
    release();
    expect(
      await screen.findByRole("region", {
        name: "Face Pull, position 3 of 3",
      }),
    ).toBeVisible();
    expect(actions.getCurrent).toHaveBeenCalled();
    expect(
      screen.queryByText("Adding to this workout…"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add a set to Face Pull" }),
    ).toBeVisible();
  });
});

describe("Delivery and recovery", () => {
  it("replays pending outbox commands into the restored state", async () => {
    const user = userEvent.setup();
    const outbox = new FakeOutbox();
    await outbox.enqueue({
      commandId: "00000000-0000-4000-8000-000000000c11",
      workoutId,
      expectedRevision: 4,
      operation: "set_workout_exercise_note",
      payload: { workoutExerciseId: squatOccurrence, note: "Pending note" },
      clientCreatedAt: "2026-09-04T10:20:00.000Z",
    });
    const { transport } = renderExperience({ outbox });

    await waitFor(() => {
      expect(transport.last("set_workout_exercise_note").payload).toMatchObject(
        { note: "Pending note" },
      );
    });
    await user.click(screen.getByRole("button", { name: "Exercise note" }));
    const note = await screen.findByRole("dialog", { name: "Note" });
    expect(
      within(note).getByText("Brace before unracking. · Today: Pending note"),
    ).toBeVisible();
    expect(screen.queryByLabelText("Restored workout")).not.toBeInTheDocument();
    await waitFor(async () => {
      expect(await outbox.list()).toHaveLength(0);
    });
  });

  it("says Saving… while a change is in flight and All changes saved once it lands", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport();
    const { outbox } = renderExperience({ transport });
    await screen.findByText("All changes saved");

    const release = transport.hold();
    await pressCandidate(user, "Load", "85");
    expect(await screen.findByText("Saving…")).toBeInTheDocument();
    expect(await outbox.list()).toHaveLength(1);

    release();
    expect(await screen.findByText("All changes saved")).toBeInTheDocument();
    expect(await outbox.list()).toHaveLength(0);
  });

  it("keeps an undelivered change and retries it on request", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport().failOnce(
      (command) => command.operation === "update_set",
      () => ({
        kind: "retry",
        code: "persistence",
        message: "The server could not be reached.",
      }),
    );
    const { outbox } = renderExperience({ transport });

    await pressCandidate(user, "Load", "85");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("The server could not be reached.");
    // The change is kept, and stays on screen as entered.
    expect(await outbox.list()).toHaveLength(1);
    expect(wheelValue("Load")).toHaveTextContent(/^85kg$/);
    expect(
      within(alert).queryByRole("button", { name: "Refresh" }),
    ).not.toBeInTheDocument();

    await user.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("All changes saved")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const deliveries = transport.all("update_set");
    expect(deliveries).toHaveLength(2);
    // The same envelope again: the server's idempotency sees one change.
    expect(deliveries[1]).toEqual(deliveries[0]);
    expect(await outbox.list()).toHaveLength(0);
  });

  it("refreshes after a conflict and replays the kept change onto the new revision", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport().failOnce(
      (command) => command.operation === "update_set",
      (command) => ({
        kind: "conflict",
        conflict: {
          commandId: command.commandId,
          workoutId,
          expectedRevision: command.expectedRevision,
          actualRevision: 9,
          recovery: "refresh_and_replay",
        },
      }),
    );
    actions.getCurrent.mockResolvedValue({
      ok: true,
      value: makeWorkout({ revision: 9 }),
    });
    const { outbox } = renderExperience({ transport });

    await pressCandidate(user, "Load", "85");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "The workout changed. Refresh it and replay pending changes.",
    );
    expect(await outbox.list()).toHaveLength(1);
    expect(
      within(alert).queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();

    await user.click(within(alert).getByRole("button", { name: "Refresh" }));
    expect(await screen.findByText("All changes saved")).toBeInTheDocument();
    const [first, replayed] = transport.all("update_set");
    expect(replayed).toBeDefined();
    // A fresh envelope rebased onto the refreshed revision, never the consumed
    // command id with a different revision.
    expect(replayed!.commandId).not.toBe(first!.commandId);
    expect(replayed!.expectedRevision).toBe(9);
    expect(replayed!.payload).toEqual(first!.payload);
    expect(wheelValue("Load")).toHaveTextContent(/^85kg$/);
    expect(await outbox.list()).toHaveLength(0);
  });

  it("returns to Today when the refreshed workout is no longer current", async () => {
    const user = userEvent.setup();
    const transport = new FakeTransport().failOnce(
      (command) => command.operation === "update_set",
      (command) => ({
        kind: "conflict",
        conflict: {
          commandId: command.commandId,
          workoutId,
          expectedRevision: command.expectedRevision,
          actualRevision: 9,
          recovery: "refresh_and_replay",
        },
      }),
    );
    actions.getCurrent.mockResolvedValue({ ok: true, value: null });
    renderExperience({ transport });

    await pressCandidate(user, "Load", "85");
    const alert = await screen.findByRole("alert");
    await user.click(within(alert).getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(actions.replace).toHaveBeenCalledWith("/today"));
  });

  it("undoes a permanently rejected change and keeps the workout usable", async () => {
    const user = userEvent.setup();
    const workout = makeWorkout();
    actions.getCurrent.mockResolvedValue({ ok: true, value: workout });
    const transport = new FakeTransport().rejectOnce(
      (command) => command.operation === "update_set",
    );
    const { outbox } = renderExperience({ workout, transport });

    await pressCandidate(user, "Load", "85");

    const notice = await screen.findByText(
      "One change could not be saved and was undone: set 2 of Squat. Everything else is saved and the workout continues.",
    );
    // The refused command left the outbox instead of blocking what follows,
    // and recovery ran without a gesture.
    await waitFor(async () => {
      expect(await outbox.list()).toHaveLength(0);
    });
    expect(await screen.findByText("All changes saved")).toBeInTheDocument();
    // The refreshed workout no longer holds the refused value.
    expect(wheelValue("Load")).toHaveTextContent(/^82\.5kg, suggested$/);
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();

    await pressCandidate(user, "Reps", "5");
    await waitFor(() => {
      expect(transport.last("update_set").payload).toMatchObject({
        workoutSetId: squatSet2,
        reps: 5,
      });
    });

    await user.click(
      within(notice.closest<HTMLElement>("[role=alert]")!).getByRole("button", {
        name: "Dismiss the undone change notice",
      }),
    );
    expect(
      screen.queryByText(/One change could not be saved/),
    ).not.toBeInTheDocument();
  });
});
