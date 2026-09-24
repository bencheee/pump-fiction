"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { correctHistoryWorkoutAction } from "@/app/actions/workout-history";
import {
  changeSetMode,
  setModeFields,
} from "@/features/active-workout/domain/set-entry";
import type { WorkoutSet } from "@/features/active-workout/domain/workout";
import {
  loadColumnFor,
  loadFallbackIndex,
  prescriptionText,
  repsColumnFor,
  repsFallbackIndex,
} from "@/features/active-workout/ui/set-queue-presentation";
import { formatSetChip } from "@/features/active-workout/ui/workout-presentation";
import {
  hasSetValues,
  isRecordedSet,
} from "@/features/history/domain/exercise-statistics";
import {
  baseLoadModeByBaseType,
  type Exercise,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import type {
  HistoryCorrection,
  HistoryWorkout,
  HistoryWorkoutExercise,
} from "@/features/history/domain/workout-history";
import {
  Action,
  ActionsPanel,
  AlertCard,
  Badge,
  Chip,
  DestructiveDialog,
  Icon,
  NoteEditorSheet,
  SetChip,
  SetValueWheels,
  Sheet,
  Stepper,
  TopBar,
  UnsavedChip,
  useToast,
  useTransientOverlay,
  type ActionEntry,
  type ValueWheelProps,
} from "@/shared/ui";

import { AddExerciseSheet } from "../../../../add-exercise-sheet";
import {
  formatCount,
  formatHistoryDate,
  formatHistoryTime,
  localDateOf,
} from "../../../history-presentation";
import "./workout-correction.css";

/*
 * Correct workout and Correct set — the prototype's screens 6 and 9 — ported
 * for step 10 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources. The Claude Design MCP would not connect this session
 * (`FIRST_PARTY_AUTH_REJECTED`), so both halves were read from the byte-exact
 * local copy of `Workout App - Prototype.dc.html` at the etag the plan records
 * — 3611 lines, 283,529 bytes, no injected preview harness:
 *   markup        lines 425-473, `data-screen-label="Correct workout"`
 *                 lines 695-747, `data-screen-label="Correct set"`
 *   bound values  lines 2079-2110 (`edSteppers`, `edDirty`, `edExercises`),
 *                 2166-2169 (`se`, `seKg`, `seReps`, `seExName`), 2206-2253
 *                 (`edName`, `edSaveBg`, `saveEdit`, the whole set editor),
 *                 `hAdjust` 2406, `editDraft` 2430, `bump` 2439
 *
 * The two screens are one draft. The steppers and the set editor write into
 * it, the tint on each set button says which sets it has moved, and `Save
 * corrections` sends the difference. What the prototype's draft cannot hold —
 * adding, removing and reordering — is a command of its own here, because the
 * shape of the workout lives on the server; see the four notes below.
 */

/** What a time stepper moves by — the five minutes `start` takes (line 2088). */
const fiveMinutesMs = 5 * 60 * 1000;

type Draft = Readonly<{
  workoutDate: string;
  startedAt: string;
  finishedAt: string;
  /** By workout-exercise id. */
  notes: Readonly<Record<string, string>>;
  /** By set id. */
  sets: Readonly<Record<string, WorkoutSet>>;
}>;

/** `openEdit` (2200): the draft is a copy of the workout, values and all. */
function draftOf(workout: HistoryWorkout): Draft {
  return {
    workoutDate: workout.workoutDate,
    startedAt: workout.startedAt,
    finishedAt: workout.finishedAt,
    notes: Object.fromEntries(
      workout.exercises.map((exercise) => [exercise.id, exercise.workoutNote]),
    ),
    sets: Object.fromEntries(
      workout.exercises.flatMap((exercise) =>
        exercise.sets.map((set) => [set.id, set]),
      ),
    ),
  };
}

export function baseModeOf(exercise: HistoryWorkoutExercise): ExerciseLoadMode {
  return (
    baseLoadModeByBaseType[exercise.exerciseBaseType] ??
    exercise.allowedLoadModes[0] ??
    "weight"
  );
}

function optionalModeOf(
  exercise: HistoryWorkoutExercise,
): ExerciseLoadMode | null {
  const base = baseModeOf(exercise);
  return exercise.allowedLoadModes.find((allowed) => allowed !== base) ?? null;
}

const loadModeNouns: Readonly<Record<ExerciseLoadMode, string>> = {
  weight: "Weight",
  weight_resistance_band: "Resistance band",
  bodyweight: "Bodyweight",
  bodyweight_added_weight: "Added weight",
  bodyweight_resistance_band: "Resistance band",
  assistance_weight: "Assistance weight",
  assistance_band: "Assistance band",
};

const bandLabels = {
  light: "Light",
  medium: "Medium",
  strong: "Strong",
} as const;

function setsMatch(left: WorkoutSet, right: WorkoutSet): boolean {
  return (
    left.loadMode === right.loadMode &&
    left.loadKg === right.loadKg &&
    left.bandStrength === right.bandStrength &&
    left.reps === right.reps
  );
}

/** What the set button says. `setText` (1666), with the application's modes. */
function setValueText(
  set: WorkoutSet,
  exercise: HistoryWorkoutExercise,
): string {
  return !hasSetValues(set)
    ? "No values"
    : formatSetChip(set, exercise.measurementType);
}

/*
 * `edDirty` (2098) asks whether the draft differs from the workout; the same
 * question here produces the corrections the save sends, so the two can never
 * disagree — an armed `Save corrections` always has something to send.
 */
function correctionsFor(
  draft: Draft,
  workout: HistoryWorkout,
): readonly HistoryCorrection[] {
  const corrections: HistoryCorrection[] = [];

  if (
    draft.workoutDate !== workout.workoutDate ||
    draft.startedAt !== workout.startedAt ||
    draft.finishedAt !== workout.finishedAt
  )
    corrections.push({
      kind: "timing",
      workoutId: workout.id,
      workoutDate: draft.workoutDate,
      startedAt: draft.startedAt,
      finishedAt: draft.finishedAt,
    });

  for (const exercise of workout.exercises) {
    const note = draft.notes[exercise.id] ?? "";
    if (note !== exercise.workoutNote)
      corrections.push({
        kind: "exercise_note",
        workoutExerciseId: exercise.id,
        note,
      });

    for (const set of exercise.sets) {
      const entry = draft.sets[set.id];
      if (entry === undefined || setsMatch(entry, set)) continue;
      corrections.push({
        kind: "update_set",
        workoutSetId: set.id,
        loadMode: entry.loadMode,
        loadKg: entry.loadKg,
        // The stored shape keeps the direction beside the strength; the mode
        // already says which it is.
        bandDirection:
          entry.loadMode === null ? null : setModeFields[entry.loadMode].band,
        bandStrength: entry.bandStrength,
        reps: entry.reps,
      });
    }
  }

  return corrections;
}

/** `shiftDate` (1668), on the workout's own local date. */
function shiftDate(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function shiftMinutes(timestamp: string, steps: number): string {
  return new Date(Date.parse(timestamp) + steps * fiveMinutesMs).toISOString();
}

export function WorkoutCorrection({
  workout,
  library,
  timeZone,
}: {
  workout: HistoryWorkout;
  library: readonly Exercise[];
  /* The configured zone, read on the server, so the server render and the
     hydration format the same minute — step 9's note. */
  timeZone: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const detailHref = `/history/workouts/${workout.id}`;
  const initial = useMemo(() => draftOf(workout), [workout]);
  const [draft, setDraft] = useState<Draft>(initial);
  /*
   * A correction that changes the shape of the workout reloads it from the
   * server. Adopt the reloaded snapshot as the new draft; it can never discard
   * an edit, because those corrections are refused while the draft holds one.
   */
  const [syncedWorkout, setSyncedWorkout] = useState(workout);
  if (syncedWorkout !== workout) {
    setSyncedWorkout(workout);
    setDraft(initial);
  }
  const [pending, startTransition] = useTransition();
  const [failure, setFailure] = useState<string>();

  const corrections = useMemo(
    () => correctionsFor(draft, workout),
    [draft, workout],
  );
  const dirty = corrections.length > 0;
  // `disabled` in the prototype is a colour; here it is also the reason a
  // structural correction has to wait — it reloads what the draft is holding.
  const frozen = pending || dirty;

  const run = (
    queue: readonly HistoryCorrection[],
    onDone: () => void,
  ): void => {
    setFailure(undefined);
    startTransition(async () => {
      for (const correction of queue) {
        const result = await correctHistoryWorkoutAction(correction);
        if (!result.ok) {
          setFailure(result.error.message);
          showToast(result.error.message);
          return;
        }
      }
      onDone();
    });
  };

  /* `saveEdit` (2210), including what it does with nothing to save. */
  const save = () => {
    if (!dirty) {
      showToast("Nothing to correct yet.");
      return;
    }
    run(corrections, () => {
      showToast("Workout corrected. Affected statistics were recalculated.");
      router.replace(detailHref);
      router.refresh();
    });
  };

  const structural = (correction: HistoryCorrection, message?: string) =>
    run([correction], () => {
      if (message !== undefined) showToast(message);
      router.refresh();
    });

  /*
   * `edSteppers` (2080). The prototype's three are the date, the start and the
   * active duration; the application's third is the finish, because that is
   * the value it can correct — the measured active duration deliberately
   * stays as it was, since paused wall-clock time cannot be reconstructed
   * afterwards. Each time steps by the five minutes the prototype gives its
   * start, and neither may cross the other, as `dur` may not fall under a
   * minute (2094).
   */
  const finishedDayOffset = Math.round(
    (Date.parse(`${localDateOf(draft.finishedAt, timeZone)}T00:00:00Z`) -
      Date.parse(`${localDateOf(draft.startedAt, timeZone)}T00:00:00Z`)) /
      86_400_000,
  );
  const steppers = [
    {
      key: "date",
      label: "Workout date",
      value: formatHistoryDate(draft.workoutDate),
      downLabel: "Previous day",
      upLabel: "Next day",
      onDown: () =>
        setDraft({ ...draft, workoutDate: shiftDate(draft.workoutDate, -1) }),
      onUp: () =>
        setDraft({ ...draft, workoutDate: shiftDate(draft.workoutDate, 1) }),
    },
    {
      key: "started",
      label: "Started at",
      value: formatHistoryTime(draft.startedAt, timeZone),
      downLabel: "Start five minutes earlier",
      upLabel: "Start five minutes later",
      onDown: () =>
        setDraft({ ...draft, startedAt: shiftMinutes(draft.startedAt, -1) }),
      onUp: () => {
        const next = shiftMinutes(draft.startedAt, 1);
        if (Date.parse(next) > Date.parse(draft.finishedAt)) return;
        setDraft({ ...draft, startedAt: next });
      },
    },
    {
      key: "finished",
      // The workout that crossed midnight, which the prototype's start-plus-
      // duration has no way to state and the application's own timestamps do.
      label:
        finishedDayOffset > 0
          ? `Finished at (+${formatCount(finishedDayOffset, "day")})`
          : "Finished at",
      value: formatHistoryTime(draft.finishedAt, timeZone),
      downLabel: "Finish five minutes earlier",
      upLabel: "Finish five minutes later",
      onDown: () => {
        const next = shiftMinutes(draft.finishedAt, -1);
        if (Date.parse(next) < Date.parse(draft.startedAt)) return;
        setDraft({ ...draft, finishedAt: next });
      },
      onUp: () =>
        setDraft({ ...draft, finishedAt: shiftMinutes(draft.finishedAt, 1) }),
    },
  ];

  return (
    <div data-correction="">
      <TopBar
        screen="workout-correction"
        title="Correct workout"
        backHref={detailHref}
        backLabel="Back"
        trailing={dirty ? <UnsavedChip /> : null}
      />

      <div data-correction-body="">
        {/* `edName` (2207) leads the sentence the prototype writes. The second
            sentence is the application's: its active duration is measured, not
            derived from these two times. */}
        <p data-correction-lead="">
          {workout.name} · corrections recalculate every statistic this workout
          feeds. The recorded active duration stays as measured.
        </p>

        <div data-correction-steppers="">
          {steppers.map((stepper) => (
            <Stepper
              key={stepper.key}
              label={stepper.label}
              value={stepper.value}
              downLabel={stepper.downLabel}
              upLabel={stepper.upLabel}
              disabled={pending}
              onDown={stepper.onDown}
              onUp={stepper.onUp}
            />
          ))}
        </div>

        <p data-correction-eyebrow="">Recorded sets</p>

        {workout.exercises.length === 0 ? (
          // A saved workout with no exercises, which the prototype has no
          // notion of: the note card the History list answers an emptiness
          // with, as the Workout detail uses it.
          <p data-note-card="">
            This workout holds no exercises. Add one to correct it.
          </p>
        ) : null}

        {workout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            count={workout.exercises.length}
            draft={draft}
            frozen={frozen}
            onSet={(set) =>
              setDraft({ ...draft, sets: { ...draft.sets, [set.id]: set } })
            }
            onNote={(note) =>
              setDraft({
                ...draft,
                notes: { ...draft.notes, [exercise.id]: note },
              })
            }
            onStructural={structural}
            onMove={(direction) => {
              const ids = workout.exercises.map((item) => item.id);
              const target = index + direction;
              const moved = ids[index];
              const other = ids[target];
              if (moved === undefined || other === undefined) return;
              ids[index] = other;
              ids[target] = moved;
              structural({
                kind: "reorder_exercises",
                workoutId: workout.id,
                workoutExerciseIds: ids,
              });
            }}
          />
        ))}

        {/* The prototype's correction screen cannot add an exercise; the
            application's has to (MVP-HIS-003), and takes the pill and the
            picker the workout overview and the split editor (line 886) end
            their lists with. */}
        <AddExerciseSheet
          initialExercises={library}
          onAdd={(exercises) => {
            for (const exercise of exercises)
              structural({
                kind: "add_exercise",
                workoutId: workout.id,
                exerciseId: exercise.id,
              });
          }}
          trigger={
            <Action
              variant="add"
              aria-label="Add exercise"
              title="Add exercise"
              disabled={frozen}
            >
              <Icon name="plus" size={17} />
              Add exercise
            </Action>
          }
        />

        {/* The footnote the split editor closes its list with (line 888). What
            it says is the application's: a correction that changes the shape
            of the workout is a command of its own and reloads it, so it waits
            for the draft to be saved or discarded. */}
        {dirty ? (
          <p data-correction-footnote="">
            Save or discard first to add, remove or reorder.
          </p>
        ) : null}
      </div>

      <div data-correction-footer="">
        {failure ? <AlertCard>{failure}</AlertCard> : null}
        <Action
          variant="commit"
          data-armed={dirty}
          aria-label="Save corrections"
          title="Save corrections"
          disabled={pending}
          onClick={save}
        >
          <Icon name="check" size={18} />
          Save corrections
        </Action>
        {/* `pop` (2177). A route rather than a press, so it is a link, and it
            leads where the bar's own Back does. */}
        <Link
          data-variant="quiet"
          href={detailHref}
          aria-label="Discard changes"
        >
          Discard changes
        </Link>
      </div>
    </div>
  );
}

/*
 * `edExercises` (2099): one card per exercise, its sets under it, each of them
 * a button into the set editor.
 *
 * The card carries one control the prototype's does not: everything the
 * application can correct about an exercise that is not a value — a set added,
 * the note, the order, the exercise removed — in the Actions panel the queue
 * opens on the set under the finger. The prototype has no screen for any of
 * them, and MVP-HIS-003 has all four.
 */
function ExerciseCard({
  exercise,
  index,
  count,
  draft,
  frozen,
  onSet,
  onNote,
  onStructural,
  onMove,
}: {
  exercise: HistoryWorkoutExercise;
  index: number;
  count: number;
  draft: Draft;
  frozen: boolean;
  onSet: (set: WorkoutSet) => void;
  onNote: (note: string) => void;
  onStructural: (correction: HistoryCorrection, message?: string) => void;
  onMove: (direction: number) => void;
}) {
  /* Step 6's mechanism: each panel carries its own history entry, so what an
     entry runs waits until the Actions panel has given its own back. */
  const actionsOverlay = useTransientOverlay();
  const noteOverlay = useTransientOverlay();
  const removeOverlay = useTransientOverlay();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pendingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (actionsOverlay.open) return;
    const next = pendingRef.current;
    if (next === null) return;
    pendingRef.current = null;
    next();
  }, [actionsOverlay.open]);

  const note = draft.notes[exercise.id] ?? "";
  // What the Workout detail's card counts: the sets that are recorded, which
  // is every value their mode requires (ADR-0027).
  const recorded = exercise.sets.filter((set) =>
    isRecordedSet(draft.sets[set.id] ?? set),
  ).length;
  const prescription = prescriptionText(exercise);
  const populated =
    exercise.sets.some(hasSetValues) || exercise.workoutNote.trim() !== "";

  const items: ActionEntry[] = [
    {
      key: "add-set",
      label: "Add a set to this exercise",
      icon: "plus",
      disabled: frozen,
      run: () =>
        onStructural({ kind: "add_set", workoutExerciseId: exercise.id }),
    },
    {
      key: "note",
      label: note.length > 0 ? "Edit workout note" : "Add a workout note",
      icon: "pencil",
      run: () => {
        pendingRef.current = () => noteOverlay.requestOpenChange(true);
      },
    },
    {
      key: "move-up",
      label: "Move up",
      icon: "arrow-up",
      disabled: frozen || index === 0,
      run: () => onMove(-1),
    },
    {
      key: "move-down",
      label: "Move down",
      icon: "arrow-down",
      disabled: frozen || index === count - 1,
      run: () => onMove(1),
    },
    {
      key: "remove-exercise",
      label: "Remove this exercise",
      icon: "trash-2",
      disabled: frozen,
      run: () => {
        if (!populated) {
          onStructural(
            {
              kind: "remove_exercise",
              workoutExerciseId: exercise.id,
              confirmedPopulatedRemoval: false,
            },
            "Exercise removed.",
          );
          return;
        }
        pendingRef.current = () => removeOverlay.requestOpenChange(true);
      },
    },
  ];

  return (
    <section
      data-correction-exercise=""
      style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
    >
      <div data-correction-exercise-head="">
        <h3>{exercise.exerciseName}</h3>
        <ActionsPanel
          panel="correction-exercise-actions"
          heading={exercise.exerciseName}
          meta={`${prescription === null ? "" : `Planned ${prescription} · `}${formatCount(recorded, "set")} recorded`}
          kind="set"
          overlay={actionsOverlay}
          items={items}
          trigger={
            <button
              ref={triggerRef}
              type="button"
              data-variant="row-icon"
              aria-label={`Actions for ${exercise.exerciseName}`}
              title="Actions"
            >
              <Icon name="ellipsis-vertical" size={15} />
            </button>
          }
        />
      </div>

      {exercise.stillInLibrary ? null : (
        // The same fact the Workout detail's card states, in the same badge:
        // an exercise whose definition has left the library cannot be added
        // back, and its snapshot is all there is.
        <p data-correction-retired="">
          <Badge>No longer in the library</Badge>
        </p>
      )}

      <div data-correction-sets="">
        {exercise.sets.length === 0 ? (
          <p data-correction-empty="">
            No sets. Add one from the actions above.
          </p>
        ) : null}
        {exercise.sets.map((set, position) => {
          const entry = draft.sets[set.id] ?? set;
          return (
            <CorrectSetSheet
              key={set.id}
              exercise={exercise}
              saved={set}
              entry={entry}
              position={position}
              count={exercise.sets.length}
              frozen={frozen}
              onApply={onSet}
              onRemove={(confirmed) =>
                onStructural(
                  {
                    kind: "remove_set",
                    workoutSetId: set.id,
                    confirmedPopulatedRemoval: confirmed,
                  },
                  confirmed
                    ? "Set removed. Affected statistics were recalculated."
                    : "Set removed.",
                )
              }
            />
          );
        })}
      </div>

      {/* The note editor is the panel the queue writes today's note in,
          shared from step 10. The note belongs to this occurrence either
          way. */}
      <NoteEditorSheet
        panel="correction-note"
        title="Workout note"
        heading={exercise.exerciseName}
        lead="Saved with this workout only."
        value={note}
        placeholder="Optional note for this occurrence"
        fieldLabel="Workout note"
        overlay={noteOverlay}
        returnFocusRef={triggerRef}
        onCommit={onNote}
      />

      <DestructiveDialog
        overlay={removeOverlay}
        title={`Remove ${exercise.exerciseName} from this workout?`}
        description="It holds recorded data. Removing it recalculates every statistic that used it, and neither your library nor the source split is changed."
        confirmLabel="Remove exercise"
        onConfirm={() =>
          onStructural(
            {
              kind: "remove_exercise",
              workoutExerciseId: exercise.id,
              confirmedPopulatedRemoval: true,
            },
            "Exercise removed. Affected statistics were recalculated.",
          )
        }
      />
    </section>
  );
}

/*
 * The Correct set overlay — the prototype's screen 9 (markup 695-747, values
 * 2220-2253). The set button on the card is its trigger, which is how the
 * prototype opens it (`st.edit`, 2107).
 *
 * `applySet` (2244) writes the wheels into the draft; `removeSet` (2249) takes
 * the set out of it. Removing is a command of its own here — the shape of a
 * saved workout lives on the server — so it closes the panel first, and asks
 * before it discards values, which the application has always done.
 */
function CorrectSetSheet({
  exercise,
  saved,
  entry,
  position,
  count,
  frozen,
  onApply,
  onRemove,
}: {
  exercise: HistoryWorkoutExercise;
  /** The set as the workout holds it, which the `Recorded` line states. */
  saved: WorkoutSet;
  /** And as the draft holds it, which the wheels open on. */
  entry: WorkoutSet;
  position: number;
  count: number;
  frozen: boolean;
  onApply: (set: WorkoutSet) => void;
  onRemove: (confirmedPopulatedRemoval: boolean) => void;
}) {
  const sheetOverlay = useTransientOverlay();
  const removeOverlay = useTransientOverlay();
  const pendingRef = useRef<(() => void) | null>(null);
  const [editing, setEditing] = useState<WorkoutSet>(entry);

  useEffect(() => {
    if (sheetOverlay.open) return;
    const next = pendingRef.current;
    if (next === null) return;
    pendingRef.current = null;
    next();
  }, [sheetOverlay.open]);

  const baseMode = baseModeOf(exercise);
  const optionalMode = optionalModeOf(exercise);
  // `seShowLoad` / `seBodyweight` (2224). The prototype reads a nullable
  // kilogram; the application reads the set's mode, which is the same question
  // of the data it holds.
  const mode = editing.loadMode ?? baseMode;
  const fields = setModeFields[mode];
  const seconds = exercise.measurementType === "seconds";
  const populated =
    saved.loadKg !== null || saved.bandStrength !== null || saved.reps !== null;

  const loadColumn = loadColumnFor(editing.loadKg, saved.loadKg);
  const repsColumn = repsColumnFor(exercise.maxReps, editing.reps, saved.reps);
  const load: ValueWheelProps | null =
    fields.load === null
      ? null
      : {
          kind: "load",
          label: "Load",
          column: loadColumn,
          value: editing.loadKg,
          fallbackIndex: loadFallbackIndex,
          unit:
            fields.load === "added_kg"
              ? "+kg"
              : fields.load === "assistance_kg"
                ? "−kg"
                : "kg",
          // The column carries the prototype's 0 and the application stores a
          // zero kilogram as no load at all, exactly as the queue does.
          onChange: (value) =>
            setEditing((current) => ({
              ...current,
              loadMode: mode,
              loadKg: value === 0 ? null : value,
            })),
        };

  const value = setValueText(entry, exercise);
  const changed = !setsMatch(entry, saved);

  return (
    <>
      <Sheet
        panel="correct-set"
        title="Correct set"
        overlay={sheetOverlay}
        onOpenChange={(open) => {
          // `st.edit` (2107) seeds the editor from the draft every time.
          if (open) setEditing(entry);
        }}
        trigger={
          <button
            type="button"
            data-correction-set=""
            data-changed={changed}
            aria-label={`Correct set ${position + 1} of ${exercise.exerciseName}, ${value}`}
          >
            <span data-correction-set-label="">Set {position + 1}</span>
            <span data-correction-set-value="">{value}</span>
            <Icon name="pencil" size={14} />
          </button>
        }
      >
        {(close) => (
          <>
            <SetChip>{`Set ${position + 1} of ${count}`}</SetChip>
            <h2 data-correct-set-name="">{exercise.exerciseName}</h2>

            {/* The mode and the band, which the prototype has no notion of on
                this screen: its sets are kilograms or bodyweight and nothing
                else. Both take the chip step 8 built, the surface this design
                switches between things with. */}
            {optionalMode === null ? null : (
              <div
                data-correct-set-options=""
                role="group"
                aria-label="Entered as"
              >
                {[baseMode, optionalMode].map((option) => (
                  <Chip
                    key={option}
                    selected={mode === option}
                    onClick={() =>
                      setEditing(
                        (current) =>
                          changeSetMode({ ...current, loadMode: mode }, option)
                            .set,
                      )
                    }
                  >
                    {loadModeNouns[option]}
                  </Chip>
                ))}
              </div>
            )}

            {fields.band === null ? null : (
              <div
                data-correct-set-options=""
                role="group"
                aria-label={
                  fields.band === "assistance"
                    ? "Assistance band"
                    : "Resistance band"
                }
              >
                {(["light", "medium", "strong"] as const).map((strength) => (
                  <Chip
                    key={strength}
                    selected={editing.bandStrength === strength}
                    onClick={() =>
                      setEditing((current) => ({
                        ...current,
                        loadMode: mode,
                        bandStrength:
                          current.bandStrength === strength ? null : strength,
                      }))
                    }
                  >
                    {bandLabels[strength]}
                  </Chip>
                ))}
              </div>
            )}

            <div data-correct-set-main="">
              <SetValueWheels
                load={load}
                reps={{
                  kind: "reps",
                  label: seconds ? "Seconds" : "Reps",
                  column: repsColumn,
                  value: editing.reps,
                  fallbackIndex: repsFallbackIndex(repsColumn),
                  unit: seconds ? "sec" : "reps",
                  onChange: (next) =>
                    setEditing((current) => ({
                      ...current,
                      loadMode: mode,
                      reps: next,
                    })),
                }}
              />
              {/* `seOriginal` (2222). The prototype states the draft's value
                  as the panel opened; this states the saved one, which is what
                  the word means and what the tint on the button is measured
                  against. */}
              <p data-correct-set-original="">
                {populated
                  ? `Recorded ${setValueText(saved, exercise)}`
                  : "Not recorded yet"}
              </p>
            </div>

            <div data-correct-set-actions="">
              <Action
                variant="commit"
                aria-label="Apply to set"
                title="Apply to set"
                onClick={() => {
                  onApply(applied(editing, saved));
                  close();
                }}
              >
                <Icon name="check" size={18} />
                Apply to set
              </Action>
              <Action
                variant="quiet"
                aria-label="Remove this set"
                title="Remove this set"
                disabled={count <= 1 || frozen}
                onClick={() => {
                  close();
                  pendingRef.current = () => {
                    if (populated) removeOverlay.requestOpenChange(true);
                    else onRemove(false);
                  };
                }}
              >
                <Icon name="trash-2" size={15} />
                Remove this set
              </Action>
            </div>
          </>
        )}
      </Sheet>

      <DestructiveDialog
        overlay={removeOverlay}
        title={`Remove set ${position + 1} of ${exercise.exerciseName}?`}
        description="Its recorded values are discarded and every statistic that used them is recalculated. The source split is unchanged."
        confirmLabel="Remove set"
        onConfirm={() => onRemove(true)}
      />
    </>
  );
}

/*
 * A set the editor is closing on. A set that was never recorded and is still
 * empty keeps no mode of its own — the database stores it that way, and
 * writing one would make an untouched set look corrected.
 */
function applied(editing: WorkoutSet, saved: WorkoutSet): WorkoutSet {
  const empty =
    editing.loadKg === null &&
    editing.bandStrength === null &&
    editing.reps === null;
  return empty && saved.loadMode === null
    ? { ...editing, loadMode: null, bandDirection: null }
    : editing;
}
