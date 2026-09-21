"use client";

import type { CSSProperties, MouseEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import type { BandStrength } from "@/features/active-workout/domain/active-workout-command";
import { setModeFields } from "@/features/active-workout/domain/set-entry";
import type {
  CurrentWorkout,
  WorkoutExercise,
  WorkoutSet,
} from "@/features/active-workout/domain/workout";
import type { Exercise } from "@/features/exercises/domain/exercise";
import {
  baseLoadModeByBaseType,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import {
  exerciseOptionalModeLabels,
  exerciseOptionalModeRemoveLabels,
} from "@/features/exercises/ui/exercise-presentation";
import {
  loadColumnFor,
  loadFallbackIndex,
  repsColumnFor,
  repsFallbackIndex,
  setChipText,
  suggestedValuesFor,
  upNextFor,
  type FlatSet,
  type SuggestedSetValues,
} from "@/features/active-workout/ui/set-queue-presentation";
import {
  formatLastPerformanceDate,
  formatSetLoad,
  formatSetReps,
  formatWorkoutClock,
} from "@/features/active-workout/ui/workout-presentation";
import {
  DestructiveDialog,
  Icon,
  type IconName,
  type ScreenAnim,
  SetValueWheels,
  Sheet,
  type TransientOverlay,
  useToast,
  useTransientOverlay,
  type ValueWheelProps,
} from "@/shared/ui";

import { AddExerciseSheet } from "./add-exercise-sheet";
import { ReviewFinishSheet } from "./review-finish-sheet";
import "./set-queue.css";

/*
 * The Active set queue, ported from the prototype for step 4 of
 * docs/design/redesign-v2/PLAN.md, and its five panels for step 6.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 131-243, `data-screen-label="Active set"`
 *   panels        1328-1350 (Actions), 1351-1379 (Last time),
 *                 1380-1394 (Note), 1395-1413 (Today's note),
 *                 1469-1503 (Review and finish)
 *   bound values  lines 3147-3178 (`renderVals` head, segments, ledger),
 *                 3262-3292 (`rawMenu`, `menuItems`), 3333-3500
 *   behaviour     `adjust` 1855-1870, `advance` 1871-1884, `notify` 1831-1836,
 *                 `formatClock` 1960-1964, `setLoadText` 1966-1970
 *
 * Six things the application knows that the prototype does not are written
 * down in the plan beside step 4, and step 6 adds its own; the comments below
 * mark each one where it lands.
 */

export type SetQueueProps = {
  workout: CurrentWorkout;
  /** Every set of the workout in order, with the pointer resolved against it. */
  flat: readonly FlatSet[];
  current: FlatSet | undefined;
  paused: boolean;
  displaySeconds: number;
  initialExercises?: readonly Exercise[];
  /** `?panel=finish`: the deep link that used to be its own route. */
  initialReviewOpen?: boolean;
  finishing: boolean;
  onTogglePause: () => void;
  onOpenOverview: () => void;
  /** `screenAnim` (line 3317): the queue and the overview are two screens of
      one route, so the transition between them is this screen's own. */
  screenAnim: ScreenAnim;
  onJump: (entry: FlatSet) => void;
  onAdvance: () => void;
  onUpdateSet: (
    set: WorkoutSet,
    mode: ExerciseLoadMode,
    changes: Partial<Pick<WorkoutSet, "loadKg" | "bandStrength" | "reps">>,
  ) => void;
  onChangeMode: (set: WorkoutSet, mode: ExerciseLoadMode) => void;
  onAddSet: (exercise: WorkoutExercise) => void;
  onRemoveSet: (set: WorkoutSet, confirmedPopulatedRemoval: boolean) => void;
  onRemoveExercise: (
    exercise: WorkoutExercise,
    confirmedPopulatedRemoval: boolean,
  ) => void;
  onNoteCommit: (exercise: WorkoutExercise, note: string) => void;
  onAddExercises: (exercises: readonly Exercise[]) => void;
  onCompleteWorkout: () => void;
  onDiscardWorkout: () => void;
};

export function baseModeOf(exercise: WorkoutExercise): ExerciseLoadMode {
  return (
    baseLoadModeByBaseType[exercise.exerciseBaseType] ??
    exercise.allowedLoadModes[0]!
  );
}

/** What the Actions panel does once it has closed itself. */
type PendingPanel = (() => void) | null;

export function SetQueue({
  workout,
  flat,
  current,
  paused,
  displaySeconds,
  initialExercises,
  initialReviewOpen = false,
  finishing,
  onTogglePause,
  onOpenOverview,
  screenAnim,
  onJump,
  onAdvance,
  onUpdateSet,
  onChangeMode,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onNoteCommit,
  onAddExercises,
  onCompleteWorkout,
  onDiscardWorkout,
}: SetQueueProps) {
  const { showToast } = useToast();
  const [lastTimeOpen, setLastTimeOpen] = useState(false);
  const [press, setPress] = useState(0);

  /*
   * The prototype keeps one `s.sheet` slot and one `s.dialog` (line 1791), and
   * an item on the Actions panel writes another name into either. Here each
   * panel is its own `Sheet` and each carries a history entry, so the panel it
   * opens has to wait until the Actions panel has given its entry back — that
   * is `pending` below, run the moment the overlay reports itself closed.
   */
  const actionsOverlay = useTransientOverlay();
  const noteDraftOverlay = useTransientOverlay();
  const reviewOverlay = useTransientOverlay();
  const confirmOverlay = useTransientOverlay();
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const pendingRef = useRef<PendingPanel>(null);
  // Radix returns focus to a panel's trigger; the two panels that have none
  // say where the press came from instead.
  const openerRef = useRef<HTMLElement | null>(null);
  // The More button, which is where the Actions panel gives focus back and so
  // where a panel it opened in turn has to give it back as well.
  const moreRef = useRef<HTMLButtonElement | null>(null);
  const requestReview = reviewOverlay.requestOpenChange;

  useEffect(() => {
    if (actionsOverlay.open) return;
    const run = pendingRef.current;
    if (run === null) return;
    pendingRef.current = null;
    run();
  }, [actionsOverlay.open]);

  // `?panel=finish` — the deep link that used to be its own route — arrives
  // without a press, so the panel opens itself once.
  const deepLinkedRef = useRef(false);
  useEffect(() => {
    if (deepLinkedRef.current || !initialReviewOpen) return;
    deepLinkedRef.current = true;
    // The panel is one history entry above the screen it covers, as every
    // panel is. Put the screen's own URL underneath it first, so closing the
    // review lands on the workout and a reload does not reopen it.
    window.history.replaceState(window.history.state, "", "/workout/current");
    requestReview(true);
  }, [initialReviewOpen, requestReview]);

  const recorded = flat.filter((entry) => entry.recorded).length;
  const empty = workout.exercises.length === 0;
  // `allDone` (line 3158). An empty workout is not finished, it is unstarted.
  const allRecorded = flat.length > 0 && recorded === flat.length;
  const upNext = upNextFor(flat, workout.exercises.length, current);

  // `stageAnim` (lines 3390-3403): the stage replays its entrance whenever the
  // set under it changes, alternating the A/B pair. The flash branch of that
  // same value belongs to the set-logging flow and arrives in step 7.
  const stageKey = current
    ? `${current.exerciseIndex}-${current.setIndex}`
    : "";
  const [stage, setStage] = useState(() => ({ key: stageKey, n: 1 }));
  if (stage.key !== stageKey) setStage({ key: stageKey, n: stage.n + 1 });

  /*
   * What the wheels offer on the set under the pointer, and what `Log set`
   * writes if the set is still empty when it is pressed (Owner, 2026-09-21).
   * `logSet()` (line 1860) marks a set done because the prototype's sets
   * always hold numbers; here the press fills in the numbers it was showing
   * and then does what `advance()` (1871) always did. A set with nothing to
   * offer is left exactly as it was, so the review still counts it.
   */
  const currentMode =
    current === undefined
      ? null
      : (current.set.loadMode ?? baseModeOf(current.exercise));
  const offer: SuggestedSetValues =
    current === undefined || currentMode === null
      ? { loadKg: null, reps: null }
      : suggestedValuesFor(current.exercise, current.setIndex, currentMode);

  function logSet() {
    if (current !== undefined && currentMode !== null) {
      const { set } = current;
      const fill = {
        ...(set.loadKg === null && offer.loadKg !== null
          ? { loadKg: offer.loadKg }
          : {}),
        ...(set.reps === null && offer.reps !== null
          ? { reps: offer.reps }
          : {}),
      };
      if (Object.keys(fill).length > 0) onUpdateSet(set, currentMode, fill);
    }
    onAdvance();
  }

  function openReview(event: MouseEvent<HTMLElement>) {
    openerRef.current = event.currentTarget;
    reviewOverlay.requestOpenChange(true);
  }

  function reviewAndFinish(event: MouseEvent<HTMLElement>) {
    // `primaryAction` (line 3407) plays the bounce and opens the review 160ms
    // later.
    openerRef.current = event.currentTarget;
    setPress((count) => count + 1);
    window.setTimeout(() => requestReview(true), 160);
  }

  return (
    <div data-queue="" data-screen-anim={screenAnim}>
      <div data-queue-bar="">
        <button
          type="button"
          data-queue-pause=""
          data-paused={paused}
          aria-label={paused ? "Resume timer" : "Pause — continue later"}
          title={paused ? "Resume timer" : "Pause — continue later"}
          onClick={onTogglePause}
        >
          <Icon name={paused ? "play" : "pause"} size={17} />
        </button>
        <span
          data-queue-clock=""
          data-paused={paused}
          aria-label="Active duration"
        >
          {formatWorkoutClock(displaySeconds)}
        </span>
        <button
          type="button"
          data-queue-overview=""
          aria-label="Workout overview"
          title="Workout overview"
          onClick={onOpenOverview}
        >
          <Icon name="layout-grid" size={18} />
        </button>
      </div>

      <div data-queue-segments="">
        {flat.map((entry) => (
          <button
            key={entry.set.id}
            type="button"
            data-queue-segment=""
            data-state={
              entry.recorded
                ? "recorded"
                : entry.set.id === current?.set.id
                  ? "current"
                  : "pending"
            }
            aria-label={`${entry.exercise.exerciseName} set ${entry.set.position}`}
            title={`${entry.exercise.exerciseName} set ${entry.set.position}`}
            onClick={() => onJump(entry)}
          >
            <span />
          </button>
        ))}
      </div>

      {paused ? (
        <p data-queue-paused="" role="status">
          <Icon name="pause" size={14} />
          Paused — active duration is not counting.
        </p>
      ) : null}

      <div data-queue-body="">
        <span data-queue-chip="">
          {current
            ? setChipText(current.exercise, current.set)
            : empty
              ? "No exercises yet"
              : "No sets yet"}
        </span>
        <h2 data-queue-exercise="">
          {current
            ? current.exercise.exerciseName
            : empty
              ? "Add an exercise to begin"
              : "Add a set to begin"}
        </h2>

        {current === undefined ? (
          /*
           * `isEmptyWorkout` (line 3331) and its block (line 154). The
           * prototype's `addPicked` (line 3444) gives a new exercise as many
           * sets as it plans; the application's `add_exercise` gives it none,
           * so a queue can also hold exercises and still have no set to show.
           * That second state has no screen in the prototype and is built from
           * this one's own surfaces, inventing no colour, radius or size — the
           * same licence step 2 took for the day with no program.
           *
           * The review pill below is step 6's: the prototype's empty queue
           * offers only Add exercise, so a workout with no exercises can be
           * neither finished nor discarded from either screen. It is the 48px
           * outline pill step 2 was the first to need.
           */
          <div data-queue-empty="">
            <Icon name="dumbbell" />
            {empty ? (
              <>
                <p>This workout has no exercises yet.</p>
                <AddExerciseSheet
                  initialExercises={initialExercises}
                  onAdd={onAddExercises}
                  trigger={
                    <button
                      type="button"
                      data-queue-add-exercise=""
                      aria-label="Add exercise"
                      title="Add exercise"
                    >
                      <Icon name="plus" size={19} />
                      Add exercise
                    </button>
                  }
                />
              </>
            ) : (
              <>
                <p>No exercise in this workout has a set yet.</p>
                <button
                  type="button"
                  data-queue-add-exercise=""
                  aria-label="Workout overview"
                  title="Workout overview"
                  onClick={onOpenOverview}
                >
                  <Icon name="layout-grid" size={19} />
                  Workout overview
                </button>
              </>
            )}
            <button
              type="button"
              data-variant="secondary"
              data-queue-empty-review=""
              aria-label="Review and finish workout"
              title="Review and finish workout"
              onClick={openReview}
            >
              Review &amp; finish workout
            </button>
          </div>
        ) : (
          <>
            <div
              data-queue-stage=""
              data-stage-anim={`stageIn${stage.n % 2 ? "A" : "B"}`}
            >
              <SetStage
                key={current.set.id}
                exercise={current.exercise}
                set={current.set}
                offer={offer}
                onUpdateSet={onUpdateSet}
                onChangeMode={onChangeMode}
              />

              <button
                type="button"
                data-queue-primary=""
                data-complete={allRecorded}
                data-press={press === 0 ? undefined : press % 2 ? "A" : "B"}
                aria-label={
                  allRecorded ? "Review and finish workout" : "Log this set"
                }
                title={
                  allRecorded ? "Review and finish workout" : "Log this set"
                }
                onClick={allRecorded ? reviewAndFinish : logSet}
              >
                <Icon name={allRecorded ? "check-check" : "check"} />
                {allRecorded ? "Review & finish" : "Log set"}
              </button>
            </div>

            <div data-queue-actions="">
              <LastTimeSheet
                exercise={current.exercise}
                open={lastTimeOpen}
                setIndex={current.setIndex}
                onOpenChange={setLastTimeOpen}
              />
              <NoteSheet exercise={current.exercise} />
              <ActionsSheet
                exercise={current.exercise}
                set={current.set}
                setIndex={current.setIndex}
                overlay={actionsOverlay}
                lastSet={current.setIndex === current.exercise.sets.length - 1}
                onChangeMode={onChangeMode}
                onAddSet={(exercise) => {
                  onAddSet(exercise);
                  showToast("Set added.");
                }}
                onRemoveSet={onRemoveSet}
                onRemoveExercise={onRemoveExercise}
                triggerRef={moreRef}
                onConfirm={(request) => {
                  openerRef.current = moreRef.current;
                  pendingRef.current = () => {
                    setConfirm(request);
                    confirmOverlay.requestOpenChange(true);
                  };
                }}
                onOpenNoteDraft={() => {
                  openerRef.current = moreRef.current;
                  pendingRef.current = () =>
                    noteDraftOverlay.requestOpenChange(true);
                }}
              />
              <button
                type="button"
                data-queue-finish=""
                aria-label="Review and finish workout"
                title="Review and finish workout"
                onClick={openReview}
              >
                <Icon name="check-check" size={17} />
              </button>
            </div>

            <div data-queue-upnext="">
              <span data-queue-upnext-kicker="">{upNext.kicker}</span>
              <span data-queue-upnext-text="">{upNext.text}</span>
            </div>
          </>
        )}
      </div>

      {current === undefined ? null : (
        <TodaysNoteSheet
          exercise={current.exercise}
          overlay={noteDraftOverlay}
          returnFocusRef={openerRef}
          onCommit={(note) => {
            onNoteCommit(current.exercise, note);
            showToast("Note saved with this workout.");
          }}
        />
      )}

      <ReviewFinishSheet
        workout={workout}
        displaySeconds={displaySeconds}
        overlay={reviewOverlay}
        returnFocusRef={openerRef}
        submitting={finishing}
        onComplete={onCompleteWorkout}
        onDiscard={onDiscardWorkout}
      />

      {confirm === null ? null : (
        <DestructiveDialog
          key={confirm.key}
          overlay={confirmOverlay}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.onConfirm}
        />
      )}
    </div>
  );
}

type ConfirmRequest = Readonly<{
  key: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}>;

/*
 * The band picker and the two wheels: everything between the set chip and the
 * primary action that depends on the set's own load mode.
 */
function SetStage({
  exercise,
  set,
  offer,
  onUpdateSet,
  onChangeMode,
}: {
  exercise: WorkoutExercise;
  set: WorkoutSet;
  offer: SuggestedSetValues;
  onUpdateSet: SetQueueProps["onUpdateSet"];
  onChangeMode: SetQueueProps["onChangeMode"];
}) {
  const mode = set.loadMode ?? baseModeOf(exercise);
  const fields = setModeFields[mode];

  // `showLoadWheel` / `showBodyweightTag` (line 3352). The prototype reads a
  // `kind` and a nullable `kg`; the application reads the set's load mode,
  // which is the same question asked of the data it actually has.
  // The offer has to be on the column, or the wheel cannot rest on it.
  const loadColumn = loadColumnFor(set.loadKg, offer.loadKg);
  const repsColumn = repsColumnFor(exercise.maxReps, set.reps, offer.reps);
  const load: ValueWheelProps | null =
    fields.load === null
      ? null
      : {
          kind: "load",
          label: "Load",
          column: loadColumn,
          value: set.loadKg,
          fallbackIndex: loadFallbackIndex,
          suggested: offer.loadKg,
          // `loadUnit` (line 3353). The prototype has no assistance mode on
          // this screen; `−kg` is the sign `formatSetSummary` already writes
          // for one.
          unit:
            fields.load === "added_kg"
              ? "+kg"
              : fields.load === "assistance_kg"
                ? "−kg"
                : "kg",
          // The column carries the prototype's 0, and `setLoadText` (line 1966)
          // reads a 0 as no load at all — which is the null the application
          // stores, its own validation refusing a zero kilogram.
          onChange: (value) =>
            onUpdateSet(set, mode, { loadKg: value === 0 ? null : value }),
        };

  return (
    <>
      {fields.band === null ? null : (
        <div data-queue-band="">
          <div data-queue-band-head="">
            <span data-queue-band-label="">
              {fields.band === "assistance"
                ? "Assistance band"
                : "Resistance band"}
            </span>
            <button
              type="button"
              data-queue-band-remove=""
              aria-label="Remove band"
              title="Remove band"
              onClick={() => onChangeMode(set, baseModeOf(exercise))}
            >
              <Icon name="x" size={12} />
              Remove
            </button>
          </div>
          <div data-queue-band-options="">
            {(["light", "medium", "strong"] as const).map((strength) => (
              <button
                key={strength}
                type="button"
                data-queue-band-option=""
                aria-pressed={set.bandStrength === strength}
                aria-label={bandLabels[strength]}
                onClick={() =>
                  onUpdateSet(set, mode, { bandStrength: strength })
                }
              >
                {bandLabels[strength]}
              </button>
            ))}
          </div>
        </div>
      )}

      <SetValueWheels
        load={load}
        reps={{
          kind: "reps",
          label: exercise.measurementType === "seconds" ? "Seconds" : "Reps",
          column: repsColumn,
          value: set.reps,
          fallbackIndex: repsFallbackIndex(repsColumn),
          suggested: offer.reps,
          unit: exercise.measurementType === "seconds" ? "sec" : "reps",
          onChange: (value) => onUpdateSet(set, mode, { reps: value }),
        }}
      />
    </>
  );
}

const bandLabels: Readonly<Record<BandStrength, string>> = {
  light: "Light",
  medium: "Medium",
  strong: "Strong",
};

/*
 * Last time — the prototype's screen 25 (lines 1351-1379), with the ledger
 * `renderVals` builds at lines 3172-3180.
 */
function LastTimeSheet({
  exercise,
  open,
  setIndex,
  onOpenChange,
}: {
  exercise: WorkoutExercise;
  open: boolean;
  setIndex: number;
  onOpenChange: (open: boolean) => void;
}) {
  const last = exercise.lastPerformance;
  // `lastTimeLabel` (line 3371) and `historyColor` (line 3377).
  const label =
    last === null
      ? "No previous performance"
      : `Last time · ${formatLastPerformanceDate(last.workoutDate)}`;

  return (
    <Sheet
      panel="queue-last"
      title="Last time"
      onOpenChange={onOpenChange}
      trigger={
        <button
          type="button"
          data-queue-action=""
          data-tone={open ? "accent" : "default"}
          aria-label={label}
          title={label}
        >
          <Icon name="history" />
          <span data-queue-action-label="">Last</span>
        </button>
      }
    >
      {(close) => (
        <>
          <h2 data-panel-heading="">{exercise.exerciseName}</h2>
          <p data-last-label="">{label}</p>
          {last !== null && last.sets.length > 0 ? (
            <ol data-last-rows="">
              {last.sets.map((set, index) => (
                <li
                  key={set.id}
                  data-last-row=""
                  data-current={index === setIndex}
                >
                  <span data-last-n="">{index + 1}</span>
                  <span data-last-load="">{formatSetLoad(set)}</span>
                  <span data-last-reps="">
                    {formatSetReps(set, last.measurementType)}
                  </span>
                </li>
              ))}
            </ol>
          ) : last !== null ? (
            /* `ledger`'s own second branch (line 3180): the exercise is here,
               its performance is not. */
            <ol data-last-rows="">
              <li data-last-row="">
                <span data-last-n="">–</span>
                <span data-last-load="">No completed performance yet</span>
                <span data-last-reps="" />
              </li>
            </ol>
          ) : (
            <p data-last-empty="">
              No previous sets recorded for this exercise.
            </p>
          )}
          <button
            type="button"
            data-panel-back=""
            aria-label="Back to set"
            title="Back to set"
            onClick={close}
          >
            Back to set
          </button>
        </>
      )}
    </Sheet>
  );
}

/* Note — the prototype's screen 26 (lines 1380-1394). */
function NoteSheet({ exercise }: { exercise: WorkoutExercise }) {
  // `noteText` (line 3169) and `noteColor` (line 3378).
  const note =
    exercise.workoutNote.length > 0
      ? `${exercise.persistentNote} · Today: ${exercise.workoutNote}`
      : exercise.persistentNote;
  const hasNote = note.trim().length > 0;
  const previous = exercise.previousWorkoutNote ?? null;

  return (
    <Sheet
      panel="queue-note"
      title="Note"
      trigger={
        <button
          type="button"
          data-queue-action=""
          data-tone={hasNote ? "accent" : "dim"}
          aria-label="Exercise note"
          title="Exercise note"
        >
          <Icon name="info" />
          <span data-queue-action-label="">Note</span>
        </button>
      }
    >
      {(close) => (
        <>
          <h2 data-panel-heading="">{exercise.exerciseName}</h2>
          <p data-note-body="" data-empty={!hasNote}>
            {hasNote ? note : "No note for this exercise."}
          </p>
          {/* The prototype has no note carried from a previous workout; the
              same card says it, a step quieter. */}
          {previous === null ? null : (
            <p data-note-body="" data-empty="true">
              Note from last workout ·{" "}
              {formatLastPerformanceDate(previous.workoutDate)}: {previous.note}
            </p>
          )}
          <button
            type="button"
            data-panel-back=""
            aria-label="Back to set"
            title="Back to set"
            onClick={close}
          >
            Back to set
          </button>
        </>
      )}
    </Sheet>
  );
}

/*
 * Today's note — the prototype's screen 27 (lines 1395-1413). It has no
 * trigger: `rawMenu`'s m4 (line 3269) opens it from the Actions panel, seeding
 * the draft from the exercise's own note.
 */
function TodaysNoteSheet({
  exercise,
  overlay,
  returnFocusRef,
  onCommit,
}: {
  exercise: WorkoutExercise;
  overlay: TransientOverlay;
  returnFocusRef: RefObject<HTMLElement | null>;
  onCommit: (note: string) => void;
}) {
  const [draft, setDraft] = useState(exercise.workoutNote);
  const fieldId = `queue-note-${exercise.id}`;

  return (
    <Sheet
      panel="queue-note-draft"
      title="Today's note"
      overlay={overlay}
      returnFocusRef={returnFocusRef}
      onOpenChange={(open) => {
        if (open) setDraft(exercise.workoutNote);
      }}
    >
      {(close) => (
        <>
          <h2 data-panel-heading="">{exercise.exerciseName}</h2>
          <p data-note-lead="">Saved with this workout only.</p>
          <textarea
            id={fieldId}
            data-note-field=""
            aria-label="Today's note"
            value={draft}
            placeholder="Optional note for this occurrence"
            onChange={(event) => setDraft(event.target.value)}
          />
          <div data-note-actions="">
            <button
              type="button"
              data-note-save=""
              aria-label="Save note"
              title="Save note"
              onClick={() => {
                onCommit(draft);
                close();
              }}
            >
              <Icon name="check" size={19} />
              Save note
            </button>
            <button
              type="button"
              data-note-cancel=""
              aria-label="Cancel"
              title="Cancel"
              onClick={close}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

type MenuItem = Readonly<{
  key: string;
  label: string;
  icon: IconName;
  disabled?: boolean;
  run: () => void;
}>;

/*
 * The Actions panel — the prototype's screen 24 (lines 1328-1350), with
 * `rawMenu` and `menuItems` at lines 3262-3292.
 *
 * It is a two-step control and not a menu of buttons: a press picks an entry,
 * and Continue at the bottom runs it. A press on the panel itself, away from
 * any control, gives the pick back (`menuBlur`, line 3427).
 */
function ActionsSheet({
  exercise,
  set,
  setIndex,
  overlay,
  triggerRef,
  lastSet,
  onChangeMode,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onConfirm,
  onOpenNoteDraft,
}: {
  exercise: WorkoutExercise;
  set: WorkoutSet;
  setIndex: number;
  overlay: TransientOverlay;
  triggerRef: RefObject<HTMLButtonElement | null>;
  lastSet: boolean;
  onChangeMode: SetQueueProps["onChangeMode"];
  onAddSet: SetQueueProps["onAddSet"];
  onRemoveSet: SetQueueProps["onRemoveSet"];
  onRemoveExercise: SetQueueProps["onRemoveExercise"];
  onConfirm: (request: ConfirmRequest) => void;
  onOpenNoteDraft: () => void;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const baseMode = baseModeOf(exercise);
  const optionalMode =
    exercise.allowedLoadModes.find((allowed) => allowed !== baseMode) ?? null;
  const mode = set.loadMode ?? baseMode;
  const optionalOn = optionalMode !== null && mode === optionalMode;
  const populatedSet =
    set.loadKg !== null || set.bandStrength !== null || set.reps !== null;
  const populatedExercise = exercise.sets.some(
    (entry) =>
      entry.loadKg !== null ||
      entry.bandStrength !== null ||
      entry.reps !== null,
  );

  const items: MenuItem[] = [];
  // m3 (line 3263). The prototype's one optional addition is weight on a
  // bodyweight exercise or a band on any other; the application reads the
  // exercise's own allowed modes, which is the same question of its data.
  if (optionalMode !== null)
    items.push({
      key: "mode",
      label: optionalOn
        ? exerciseOptionalModeRemoveLabels[optionalMode]
        : exerciseOptionalModeLabels[optionalMode],
      icon: optionalOn ? "minus" : "plus",
      run: () => onChangeMode(set, optionalOn ? baseMode : optionalMode),
    });
  // m4 (line 3268).
  items.push({
    key: "note",
    label:
      exercise.workoutNote.length > 0
        ? "Edit today's note"
        : "Add today's note",
    icon: "pencil",
    run: onOpenNoteDraft,
  });
  // m1 (line 3270): only on the exercise's last set.
  if (lastSet)
    items.push({
      key: "add-set",
      label: "Add a set to this exercise",
      icon: "plus",
      run: () => onAddSet(exercise),
    });
  // m2 (line 3272).
  items.push({
    key: "remove-set",
    label: "Remove this set",
    icon: "x",
    disabled: exercise.sets.length <= 1,
    run: () => {
      if (!populatedSet) {
        onRemoveSet(set, false);
        return;
      }
      onConfirm({
        key: `remove-set-${set.id}`,
        title: `Remove set ${set.position} of ${exercise.exerciseName}?`,
        description:
          "Its entered values are discarded. The source split is unchanged.",
        confirmLabel: "Remove",
        onConfirm: () => onRemoveSet(set, true),
      });
    },
  });
  // m7 (line 3274).
  items.push({
    key: "remove-exercise",
    label: "Remove this exercise",
    icon: "trash-2",
    run: () => {
      if (!populatedExercise) {
        onRemoveExercise(exercise, false);
        return;
      }
      onConfirm({
        key: `remove-exercise-${exercise.id}`,
        title: `Remove ${exercise.exerciseName} from this workout?`,
        description:
          "Entered sets are discarded. Your library and the source split are unchanged.",
        confirmLabel: "Remove",
        onConfirm: () => onRemoveExercise(exercise, true),
      });
    },
  });
  /*
   * `rawMenu`'s m9 (line 3276) is not here: the Owner took Review & finish out
   * of this panel on 2026-09-21. The round accent button beside More opens it,
   * and so do the completed primary and the empty queue's own pill, so nothing
   * became unreachable.
   */

  const picked = items.find((item) => item.key === pick) ?? null;

  return (
    <Sheet
      panel="queue-actions"
      title="Actions"
      overlay={overlay}
      onOpenChange={(open) => {
        // `closeSheet` (line 3461) gives the pick back with the panel.
        if (!open) setPick(null);
      }}
      onBodyClick={(event) => {
        // `menuBlur` (3427). The prototype hangs this on the panel root; the
        // 60px bar above the body holds nothing but the title and Close.
        if ((event.target as HTMLElement).closest("button") !== null) return;
        setPick(null);
      }}
      trigger={
        <button
          ref={triggerRef}
          type="button"
          data-queue-action=""
          data-tone="default"
          aria-label="More actions"
          title="More actions"
        >
          <Icon name="ellipsis-vertical" />
          <span data-queue-action-label="">More</span>
        </button>
      }
    >
      {(close) => (
        <>
          <h2 data-menu-name="">{exercise.exerciseName}</h2>
          <p data-menu-meta="">
            {`Set ${setIndex + 1} of ${exercise.sets.length} · ${formatSetLoad(set)} × ${set.reps ?? "—"}${
              exercise.measurementType === "seconds" ? " sec" : ""
            }`}
          </p>
          <div data-menu-list="">
            {items.map((item, index) => (
              <button
                key={item.key}
                type="button"
                data-menu-item=""
                aria-pressed={pick === item.key}
                aria-label={item.label}
                disabled={item.disabled}
                style={
                  {
                    "--menu-row-delay": `${40 + index * 45}ms`,
                  } as CSSProperties
                }
                onClick={() => setPick(item.key)}
              >
                <Icon name={item.icon} size={20} />
                <span data-menu-label="">{item.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            data-menu-continue=""
            data-armed={picked !== null}
            aria-label="Continue"
            title="Continue"
            disabled={picked === null}
            onClick={() => {
              if (picked === null) return;
              setPick(null);
              close();
              picked.run();
            }}
          >
            <Icon name="chevron-right" size={18} />
            Continue
          </button>
        </>
      )}
    </Sheet>
  );
}
