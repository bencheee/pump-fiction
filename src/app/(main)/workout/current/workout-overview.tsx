"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useRef, useState } from "react";

import type {
  CurrentWorkout,
  WorkoutExercise,
} from "@/features/active-workout/domain/workout";
import type { Exercise } from "@/features/exercises/domain/exercise";
import type { FlatSet } from "@/features/active-workout/ui/set-queue-presentation";
import {
  overviewKicker,
  overviewRowMeta,
  recordedSummaryText,
  resumeLabelFor,
} from "@/features/active-workout/ui/workout-overview-presentation";
import { formatWorkoutClock } from "@/features/active-workout/ui/workout-presentation";
import {
  Action,
  DestructiveDialog,
  Icon,
  TopBar,
  type ScreenAnim,
} from "@/shared/ui";

import { AddExerciseSheet } from "../../add-exercise-sheet";
import "./workout-overview.css";

/*
 * The Start workout overview, ported from the prototype for step 5 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 231-261, `data-screen-label="Start workout"`
 *   bound values  lines 3187-3221 (the `overview` rows), 3317-3320
 *                 (`screenAnim`, `hasExercise`, `clock`, `clockColor`,
 *                 `workoutName`), 3344-3345 (`goWorkout`, `goBack`), 3351
 *                 (`overviewKicker`), 3435-3437 (`recordedSummary`,
 *                 `resumeLabel`, `openAddExercise`)
 *   behaviour     `rowDragStart` 3538, `rowDragMove` 3552, `rowDragEnd` 3574,
 *                 `removeExerciseAt` 3600, `navAll` 2454
 *
 * The rows also compute `ex.sets`, `ex.addSet` and `ex.jump` (lines 3208-3220)
 * that no markup in the prototype draws; the set chips they fed are gone from
 * this screen. The one the application needs back is `addSet`, and only on the
 * row that has no sets — see `EMPTY ROW` below.
 */

/** `rowDragStart` (3538): the hold before a row lifts, and the slip that cancels it. */
const holdMs = 180;
const slipPx = 8;
/** `heights` and `gap` (3540, 3541): the row height it falls back to, and the list's gap. */
const fallbackRowHeight = 74;
const rowGap = 10;

type Drag = Readonly<{
  index: number;
  startY: number;
  heights: readonly number[];
  active: boolean;
}>;

/** What the lifted row makes the screen draw: nothing here is read from a ref. */
type DragState = Readonly<{
  index: number;
  offset: number;
  target: number;
  height: number;
}>;

export type WorkoutOverviewProps = {
  workout: CurrentWorkout;
  flat: readonly FlatSet[];
  current: FlatSet | undefined;
  paused: boolean;
  displaySeconds: number;
  screenAnim: ScreenAnim;
  /** An exercise whose `add_exercise` has not been acknowledged yet, and the
      name it was added under; the prototype has no notion of either. */
  placeholderIds: ReadonlySet<string>;
  placeholderNames: Readonly<Record<string, string>>;
  initialExercises?: readonly Exercise[];
  onBack: () => void;
  onResume: () => void;
  onAddExercises: (exercises: readonly Exercise[]) => void;
  onAddSet: (exercise: WorkoutExercise) => void;
  onRemoveExercise: (
    exercise: WorkoutExercise,
    confirmedPopulatedRemoval: boolean,
  ) => void;
  onMoveExercise: (from: number, to: number) => void;
};

export function WorkoutOverview({
  workout,
  flat,
  current,
  paused,
  displaySeconds,
  screenAnim,
  placeholderIds,
  placeholderNames,
  initialExercises,
  onBack,
  onResume,
  onAddExercises,
  onAddSet,
  onRemoveExercise,
  onMoveExercise,
}: WorkoutOverviewProps) {
  const rowEls = useRef<(HTMLElement | null)[]>([]);
  const drag = useRef<Drag | null>(null);
  const holdTimer = useRef<number | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [moveAnnouncement, setMoveAnnouncement] = useState("");

  const recorded = flat.filter((entry) => entry.recorded).length;
  const exercises = workout.exercises;

  /* `rowDragStart` (3538). A press that starts on a button is the button's. */
  function pointerDown(index: number, event: PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button") !== null) return;
    const element = event.currentTarget;
    const pointerId = event.pointerId;
    const heights = exercises.map(
      (_unused, position) =>
        rowEls.current[position]?.offsetHeight ?? fallbackRowHeight,
    );
    drag.current = { index, startY: event.clientY, heights, active: false };
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      if (drag.current === null) return;
      drag.current = { ...drag.current, active: true };
      // The prototype captures the pointer so a drag that leaves the row still
      // reaches it; a capture a browser refuses leaves the drag on the row.
      try {
        element.setPointerCapture(pointerId);
      } catch {
        /* no capture */
      }
      setDragState({
        index,
        offset: 0,
        target: index,
        height: heights[index] ?? fallbackRowHeight,
      });
    }, holdMs);
  }

  /* `rowDragMove` (3552). */
  function pointerMove(event: PointerEvent<HTMLElement>) {
    const held = drag.current;
    if (held === null) return;
    const offset = event.clientY - held.startY;
    if (!held.active) {
      if (Math.abs(offset) > slipPx) {
        if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
        drag.current = null;
      }
      return;
    }
    let target = held.index;
    let accumulated = 0;
    if (offset > 0) {
      for (let k = held.index + 1; k < held.heights.length; k += 1) {
        const step = held.heights[k]! + rowGap;
        if (offset > accumulated + step / 2) {
          target = k;
          accumulated += step;
        } else break;
      }
    } else if (offset < 0) {
      for (let k = held.index - 1; k >= 0; k -= 1) {
        const step = held.heights[k]! + rowGap;
        if (-offset > accumulated + step / 2) {
          target = k;
          accumulated += step;
        } else break;
      }
    }
    setDragState((state) =>
      state === null ? null : { ...state, offset, target },
    );
  }

  /* `rowDragEnd` (3574). */
  function pointerUp() {
    const held = drag.current;
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    drag.current = null;
    if (held === null) return;
    const target = dragState?.target;
    setDragState(null);
    if (!held.active || target === undefined || target === held.index) return;
    onMoveExercise(held.index, target);
  }

  /*
   * KEYBOARD REORDER — the application's, not the prototype's. Its row is a
   * `<section>` nothing can focus and reordering is a drag alone; the screen
   * this one replaces had a named Move control on every row. The row here is
   * focusable and Alt with an arrow moves it, which draws nothing and leaves
   * the drag exactly as the prototype wrote it.
   */
  function keyDown(index: number, event: KeyboardEvent<HTMLElement>) {
    if (!event.altKey) return;
    const to =
      event.key === "ArrowUp"
        ? index - 1
        : event.key === "ArrowDown"
          ? index + 1
          : null;
    if (to === null) return;
    event.preventDefault();
    if (to < 0 || to >= exercises.length) return;
    onMoveExercise(index, to);
    setMoveAnnouncement(
      `${exercises[index]!.exerciseName} moved to position ${to + 1} of ${exercises.length}.`,
    );
  }

  return (
    <div data-overview="" data-screen-anim={screenAnim}>
      <TopBar
        screen="workout-overview"
        title={workout.name}
        backLabel="Back"
        onBack={onBack}
        trailing={
          <span
            data-overview-clock=""
            data-paused={paused}
            aria-label="Active duration"
          >
            {formatWorkoutClock(displaySeconds)}
          </span>
        }
      />

      <div data-overview-body="">
        <p data-overview-kicker="">
          {overviewKicker(exercises.length, flat.length)}
        </p>

        {exercises.map((exercise, index) => {
          const recordedHere = flat.filter(
            (entry) => entry.exercise.id === exercise.id && entry.recorded,
          ).length;
          const populated = exercise.sets.some(
            (set) =>
              set.loadKg !== null ||
              set.bandStrength !== null ||
              set.reps !== null,
          );
          const lifted = dragState !== null && dragState.index === index;
          const shift = lifted ? dragState.offset : shiftFor(dragState, index);
          /*
           * An `add_exercise` the server has not acknowledged yet. The
           * application has always drawn it as the row it is about to become,
           * under the name it was added with; until it arrives it carries no
           * control and cannot be dragged, since neither its id nor its
           * position exists anywhere but here.
           */
          const arriving = placeholderIds.has(exercise.id);
          const name = arriving
            ? (placeholderNames[exercise.id] ?? "New exercise")
            : exercise.exerciseName;

          return (
            <section
              key={exercise.id}
              ref={(element) => {
                rowEls.current[index] = element;
              }}
              data-overview-row=""
              data-current={exercise.id === current?.exercise.id}
              data-drag={lifted ? "lifted" : undefined}
              data-shifted={shift === 0 ? undefined : ""}
              data-arriving={arriving ? "" : undefined}
              style={
                shift === 0
                  ? undefined
                  : ({ "--row-shift": `${shift}px` } as CSSProperties)
              }
              tabIndex={arriving ? undefined : 0}
              aria-label={
                arriving
                  ? undefined
                  : `${name}, position ${index + 1} of ${exercises.length}`
              }
              aria-describedby={arriving ? undefined : "overview-reorder-hint"}
              onPointerDown={
                arriving ? undefined : (event) => pointerDown(index, event)
              }
              onPointerMove={arriving ? undefined : pointerMove}
              onPointerUp={arriving ? undefined : pointerUp}
              onPointerCancel={arriving ? undefined : pointerUp}
              onKeyDown={
                arriving ? undefined : (event) => keyDown(index, event)
              }
            >
              <span data-overview-row-text="">
                <span data-overview-row-name="">{name}</span>
                <span
                  data-overview-row-meta=""
                  role={arriving ? "status" : undefined}
                >
                  {arriving
                    ? "Adding to this workout…"
                    : overviewRowMeta(exercise, recordedHere)}
                </span>
              </span>

              {arriving ? null : (
                <>
                  {/*
                   * EMPTY ROW — the application's. `addPicked` (line 3444) gives a
                   * new exercise as many sets as it plans; `add_exercise` gives it
                   * none, and the queue's own empty state sends that workout here.
                   * The row's own `addSet` (3208) is what this presses, on the one
                   * row that would otherwise have no way back to the queue.
                   */}
                  {exercise.sets.length === 0 ? (
                    <Action
                      variant="row-icon"
                      aria-label={`Add a set to ${exercise.exerciseName}`}
                      title={`Add a set to ${exercise.exerciseName}`}
                      onClick={() => onAddSet(exercise)}
                    >
                      <Icon name="plus" size={15} />
                    </Action>
                  ) : null}

                  {/* `ex.remove` (3203): a populated exercise asks first, with the
                  prototype's own words. The label names the exercise, as the
                  prototype's own second copy of this button does (line 861). */}
                  {populated ? (
                    <DestructiveDialog
                      trigger={
                        <Action
                          variant="row-icon"
                          aria-label={`Remove ${exercise.exerciseName}`}
                          title={`Remove ${exercise.exerciseName}`}
                        >
                          <Icon name="trash-2" size={15} />
                        </Action>
                      }
                      title={`Remove ${exercise.exerciseName} from this workout?`}
                      description="Entered sets are discarded. Your library and the source split are unchanged."
                      confirmLabel="Remove"
                      onConfirm={() => onRemoveExercise(exercise, true)}
                    />
                  ) : (
                    <Action
                      variant="row-icon"
                      aria-label={`Remove ${exercise.exerciseName}`}
                      title={`Remove ${exercise.exerciseName}`}
                      onClick={() => onRemoveExercise(exercise, false)}
                    >
                      <Icon name="trash-2" size={15} />
                    </Action>
                  )}
                </>
              )}
            </section>
          );
        })}

        {/* `openAddExercise` (3437) opens screen 28, which step 6 ports. */}
        <AddExerciseSheet
          initialExercises={initialExercises}
          onAdd={onAddExercises}
          trigger={
            <Action
              variant="add"
              aria-label="Add exercise"
              title="Add exercise"
            >
              <Icon name="plus" size={17} />
              Add exercise
            </Action>
          }
        />
      </div>

      <div data-overview-footer="">
        <span data-overview-summary="">
          {recordedSummaryText(recorded, flat.length)}
        </span>
        {/*
         * `hasExercise` (3318) is `Boolean(e)`, and the prototype's exercises
         * always have sets. Here the button resumes a set, so it appears once
         * there is one to resume; a workout that has none shows the queue's own
         * empty state, which points back at this screen.
         */}
        {current === undefined ? null : (
          <Action
            data-overview-resume=""
            aria-label="Resume current set"
            title="Resume current set"
            onClick={onResume}
          >
            <Icon name="play" size={18} />
            <span data-overview-resume-label="">
              {resumeLabelFor(recorded, current)}
            </span>
          </Action>
        )}
      </div>

      <p id="overview-reorder-hint" data-overview-hint="">
        Hold an exercise to drag it, or press Alt with the up or down arrow to
        move it.
      </p>
      <p data-overview-hint="" role="status" aria-live="polite">
        {moveAnnouncement}
      </p>
    </div>
  );
}

/*
 * `ex.transform` (lines 3191-3193): every row between the lifted one and where
 * it would land moves one row height out of its way, and the rest stay put.
 */
function shiftFor(dragState: DragState | null, index: number): number {
  if (dragState === null) return 0;
  const { index: from, target } = dragState;
  const height = dragState.height + rowGap;
  if (target > from && index > from && index <= target) return -height;
  if (target < from && index >= target && index < from) return height;
  return 0;
}
