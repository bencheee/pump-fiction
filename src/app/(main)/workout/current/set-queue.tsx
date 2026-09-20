"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { exerciseOptionalModeLabels } from "@/features/exercises/ui/exercise-presentation";
import {
  loadColumnFor,
  loadFallbackIndex,
  repsColumnFor,
  repsFallbackIndex,
  setChipText,
  upNextFor,
  type FlatSet,
} from "@/features/active-workout/ui/set-queue-presentation";
import {
  formatLastPerformanceDate,
  formatWorkoutSetLine,
  formatWorkoutClock,
} from "@/features/active-workout/ui/workout-presentation";
import {
  DestructiveDialog,
  Icon,
  SetValueWheels,
  Sheet,
  type ValueWheelProps,
} from "@/shared/ui";

import { AddExerciseSheet } from "./add-exercise-sheet";
import "./set-queue.css";

/*
 * The Active set queue, ported from the prototype for step 4 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 131-243, `data-screen-label="Active set"`
 *   bound values  lines 3147-3178 (`renderVals` head, segments, ledger),
 *                 3243-3256 (up next), 3333-3420 (the screen's own values)
 *   behaviour     `adjust` 1855-1870, `advance` 1871-1884,
 *                 `formatClock` 1960-1964, `setLoadText` 1966-1970
 *
 * Six things the application knows that the prototype does not are written
 * down in the plan beside step 4; the comments below mark each one where it
 * lands.
 */

export type SetQueueProps = {
  workout: CurrentWorkout;
  /** Every set of the workout in order, with the pointer resolved against it. */
  flat: readonly FlatSet[];
  current: FlatSet | undefined;
  paused: boolean;
  displaySeconds: number;
  initialExercises?: readonly Exercise[];
  onTogglePause: () => void;
  onOpenOverview: () => void;
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
};

export function baseModeOf(exercise: WorkoutExercise): ExerciseLoadMode {
  return (
    baseLoadModeByBaseType[exercise.exerciseBaseType] ??
    exercise.allowedLoadModes[0]!
  );
}

export function SetQueue({
  workout,
  flat,
  current,
  paused,
  displaySeconds,
  initialExercises,
  onTogglePause,
  onOpenOverview,
  onJump,
  onAdvance,
  onUpdateSet,
  onChangeMode,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onNoteCommit,
  onAddExercises,
}: SetQueueProps) {
  const router = useRouter();
  const [lastTimeOpen, setLastTimeOpen] = useState(false);
  const [press, setPress] = useState(0);

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

  function reviewAndFinish() {
    // `primaryAction` (line 3407) plays the bounce and opens the review 160ms
    // later. The review panel is the prototype's screen 30 and arrives in step
    // 6; until then the press lands on the review screen the app already has.
    setPress((count) => count + 1);
    window.setTimeout(() => router.push("/workout/current/finish"), 160);
  }

  return (
    <div data-queue="">
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
                onClick={allRecorded ? reviewAndFinish : onAdvance}
              >
                <Icon name={allRecorded ? "check-check" : "check"} />
                {allRecorded ? "Review & finish" : "Log set"}
              </button>
            </div>

            <div data-queue-actions="">
              <LastTimeSheet
                exercise={current.exercise}
                open={lastTimeOpen}
                onOpenChange={setLastTimeOpen}
              />
              <NoteSheet exercise={current.exercise} />
              <MoreSheet
                exercise={current.exercise}
                set={current.set}
                lastSet={current.setIndex === current.exercise.sets.length - 1}
                onChangeMode={onChangeMode}
                onAddSet={onAddSet}
                onRemoveSet={onRemoveSet}
                onRemoveExercise={onRemoveExercise}
                onNoteCommit={onNoteCommit}
                onReview={() => router.push("/workout/current/finish")}
              />
              <button
                type="button"
                data-queue-finish=""
                aria-label="Review and finish workout"
                title="Review and finish workout"
                onClick={() => router.push("/workout/current/finish")}
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
    </div>
  );
}

/*
 * The band picker and the two wheels: everything between the set chip and the
 * primary action that depends on the set's own load mode.
 */
function SetStage({
  exercise,
  set,
  onUpdateSet,
  onChangeMode,
}: {
  exercise: WorkoutExercise;
  set: WorkoutSet;
  onUpdateSet: SetQueueProps["onUpdateSet"];
  onChangeMode: SetQueueProps["onChangeMode"];
}) {
  const mode = set.loadMode ?? baseModeOf(exercise);
  const fields = setModeFields[mode];

  // `showLoadWheel` / `showBodyweightTag` (line 3352). The prototype reads a
  // `kind` and a nullable `kg`; the application reads the set's load mode,
  // which is the same question asked of the data it actually has.
  const loadColumn = loadColumnFor(set.loadKg);
  const repsColumn = repsColumnFor(exercise.maxReps, set.reps);
  const load: ValueWheelProps | null =
    fields.load === null
      ? null
      : {
          kind: "load",
          label: "Load",
          column: loadColumn,
          value: set.loadKg,
          fallbackIndex: loadFallbackIndex,
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
 * The three secondary buttons open the prototype's screens 25, 26 and 24,
 * which step 6 ports. Until then each one opens the shared panel with the
 * content the application already holds, unstyled: the button beside them is
 * this screen's and is ported, what opens behind it is not yet.
 */
function LastTimeSheet({
  exercise,
  open,
  onOpenChange,
}: {
  exercise: WorkoutExercise;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const last = exercise.lastPerformance;
  // `lastTimeLabel` (line 3370) and `historyColor` (line 3376).
  const label =
    last === null
      ? "No previous performance"
      : `Last time · ${formatLastPerformanceDate(last.workoutDate)}`;

  return (
    <Sheet
      title="Last time"
      description={label}
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
      <div>
        <h2>{exercise.exerciseName}</h2>
        {last === null || last.sets.length === 0 ? (
          <p>No previous sets recorded for this exercise.</p>
        ) : (
          <ol>
            {last.sets.map((set) => (
              <li key={set.id}>
                {formatWorkoutSetLine(set, last.measurementType)}
              </li>
            ))}
          </ol>
        )}
      </div>
    </Sheet>
  );
}

function NoteSheet({ exercise }: { exercise: WorkoutExercise }) {
  // `noteText` (line 3168) and `noteColor` (line 3377).
  const note =
    exercise.workoutNote.length > 0
      ? `${exercise.persistentNote} · Today: ${exercise.workoutNote}`
      : exercise.persistentNote;
  const hasNote = note.trim().length > 0;

  return (
    <Sheet
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
      <div>
        <h2>{exercise.exerciseName}</h2>
        <p>{hasNote ? note : "No note for this exercise."}</p>
        {exercise.previousWorkoutNote ? (
          <p>
            Note from last workout ·{" "}
            {formatLastPerformanceDate(
              exercise.previousWorkoutNote.workoutDate,
            )}
            : {exercise.previousWorkoutNote.note}
          </p>
        ) : null}
      </div>
    </Sheet>
  );
}

/*
 * `rawMenu` (lines 3262-3281). The six entries are this screen's own work and
 * are wired to the commands the application already has; the panel they sit in
 * is the prototype's screen 24, which step 6 ports.
 */
function MoreSheet({
  exercise,
  set,
  lastSet,
  onChangeMode,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onNoteCommit,
  onReview,
}: {
  exercise: WorkoutExercise;
  set: WorkoutSet;
  lastSet: boolean;
  onChangeMode: SetQueueProps["onChangeMode"];
  onAddSet: SetQueueProps["onAddSet"];
  onRemoveSet: SetQueueProps["onRemoveSet"];
  onRemoveExercise: SetQueueProps["onRemoveExercise"];
  onNoteCommit: SetQueueProps["onNoteCommit"];
  onReview: () => void;
}) {
  const baseMode = baseModeOf(exercise);
  const optionalMode =
    exercise.allowedLoadModes.find((allowed) => allowed !== baseMode) ?? null;
  const mode = set.loadMode ?? baseMode;
  const populatedSet =
    set.loadKg !== null || set.bandStrength !== null || set.reps !== null;
  const populatedExercise = exercise.sets.some(
    (entry) =>
      entry.loadKg !== null ||
      entry.bandStrength !== null ||
      entry.reps !== null,
  );

  return (
    <Sheet
      title="Actions"
      description={`${exercise.exerciseName} · set ${set.position} of ${exercise.sets.length}`}
      trigger={
        <button
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
        <ul>
          {optionalMode === null ? null : (
            <li>
              <button
                type="button"
                onClick={() => {
                  onChangeMode(
                    set,
                    mode === optionalMode ? baseMode : optionalMode,
                  );
                  close();
                }}
              >
                {mode === optionalMode
                  ? "Remove the optional load"
                  : exerciseOptionalModeLabels[optionalMode]}
              </button>
            </li>
          )}
          <li>
            <NoteEditor
              exercise={exercise}
              onCommit={(note) => {
                onNoteCommit(exercise, note);
                close();
              }}
            />
          </li>
          {lastSet ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  onAddSet(exercise);
                  close();
                }}
              >
                Add a set to this exercise
              </button>
            </li>
          ) : null}
          <li>
            {populatedSet ? (
              <DestructiveDialog
                trigger={
                  <button type="button" disabled={exercise.sets.length <= 1}>
                    Remove this set
                  </button>
                }
                title={`Remove set ${set.position} of ${exercise.exerciseName}?`}
                description="Its entered values are discarded. The source split is unchanged."
                confirmLabel="Remove Set"
                onConfirm={() => {
                  onRemoveSet(set, true);
                  close();
                }}
              />
            ) : (
              <button
                type="button"
                disabled={exercise.sets.length <= 1}
                onClick={() => {
                  onRemoveSet(set, false);
                  close();
                }}
              >
                Remove this set
              </button>
            )}
          </li>
          <li>
            {populatedExercise ? (
              <DestructiveDialog
                trigger={<button type="button">Remove this exercise</button>}
                title={`Remove ${exercise.exerciseName} from this workout?`}
                description="Entered sets are discarded. Your library and the source split are unchanged."
                confirmLabel="Remove Exercise"
                onConfirm={() => {
                  onRemoveExercise(exercise, true);
                  close();
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  onRemoveExercise(exercise, false);
                  close();
                }}
              >
                Remove this exercise
              </button>
            )}
          </li>
          <li>
            <button type="button" onClick={onReview}>
              Review &amp; finish workout
            </button>
          </li>
        </ul>
      )}
    </Sheet>
  );
}

function NoteEditor({
  exercise,
  onCommit,
}: {
  exercise: WorkoutExercise;
  onCommit: (note: string) => void;
}) {
  const [draft, setDraft] = useState(exercise.workoutNote);
  const fieldId = `queue-note-${exercise.id}`;

  return (
    <div>
      <label htmlFor={fieldId}>
        Today&rsquo;s note · saved with this workout
      </label>
      <textarea
        id={fieldId}
        value={draft}
        placeholder="Optional note for this occurrence"
        onChange={(event) => setDraft(event.target.value)}
      />
      <button type="button" onClick={() => onCommit(draft)}>
        {exercise.workoutNote.length > 0
          ? "Edit today's note"
          : "Add today's note"}
      </button>
    </div>
  );
}
