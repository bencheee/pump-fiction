"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { listExercisesAction } from "@/app/actions/exercises";
import { isSetRecorded } from "@/features/active-workout/domain/set-entry";
import type {
  CurrentWorkout,
  WorkoutExercise,
} from "@/features/active-workout/domain/workout";
import {
  formatLastPerformanceDate,
  formatWorkoutSetLine,
} from "@/features/active-workout/ui/workout-presentation";
import type { Exercise } from "@/features/exercises/domain/exercise";
import { exerciseTypeLabels } from "@/features/exercises/ui/exercise-presentation";
import { Action, Icon, Overlay, SearchField, TextAreaField } from "@/shared/ui";

/** Picking exercises out of the active library, for this workout only. */
export function AddExerciseOverlay({
  trigger,
  initialExercises,
  onAdd,
}: {
  trigger: ReactElement;
  initialExercises?: readonly Exercise[];
  onAdd: (exercises: readonly Exercise[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [exercises, setExercises] = useState<readonly Exercise[] | null>(
    initialExercises ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function loadExercises() {
    if (exercises !== null || loading) return;
    setLoading(true);
    setError(undefined);
    const result = await listExercisesAction();
    if (result.ok) setExercises(result.value);
    else setError(result.error.message);
    setLoading(false);
  }

  const filtered = (exercises ?? []).filter((exercise) =>
    exercise.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Overlay
      title="Add exercise"
      description="Your active library. This workout only."
      trigger={trigger}
      onOpenChange={(open) => {
        if (open) void loadExercises();
        else {
          setSelected([]);
          setQuery("");
        }
      }}
      footer={(close) => (
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => {
            const chosen = (exercises ?? []).filter((exercise) =>
              selected.includes(exercise.id),
            );
            if (chosen.length === 0) return;
            setSelected([]);
            close();
            onAdd(chosen);
          }}
          className={
            selected.length === 0
              ? "flex h-[var(--pf-size-primary-action)] items-center justify-center gap-2.5 rounded-full bg-[var(--pf-bg-surface)] text-[17px] font-semibold text-[var(--pf-text-4)]"
              : "flex h-[var(--pf-size-primary-action)] items-center justify-center gap-2.5 rounded-full bg-[var(--pf-accent)] text-[17px] font-semibold text-[var(--pf-on-accent)]"
          }
        >
          <Icon name="plus" size={18} />
          {selected.length === 0
            ? "Select exercises"
            : `Add ${selected.length} selected`}
        </button>
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <SearchField
          id="add-exercise-search"
          label="Search active library"
          placeholder="Search active library"
          value={query}
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
        {loading ? (
          <p
            role="status"
            className="flex min-h-20 items-center justify-center gap-2 text-[var(--pf-text-3)]"
          >
            <Icon name="loader-circle" size={16} /> Loading exercises…
          </p>
        ) : error ? (
          <div className="py-3 text-center">
            <p role="alert" className="text-[var(--pf-danger)]">
              {error}
            </p>
            <button
              type="button"
              className="mt-2 min-h-11 font-semibold text-[var(--pf-accent)]"
              onClick={() => void loadExercises()}
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-center text-[var(--pf-text-3)]">
            No active exercise matches this search.
          </p>
        ) : (
          <ul className="flex min-h-0 flex-col gap-2">
            {filtered.map((exercise) => {
              const on = selected.includes(exercise.id);
              return (
                <li key={exercise.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setSelected((current) =>
                        current.includes(exercise.id)
                          ? current.filter((item) => item !== exercise.id)
                          : [...current, exercise.id],
                      )
                    }
                    className={
                      on
                        ? "flex min-h-[68px] w-full items-center gap-3.5 rounded-[var(--pf-r3)] border border-transparent bg-[var(--pf-accent-dim)] px-[18px] py-3.5 text-left"
                        : "flex min-h-[68px] w-full items-center gap-3.5 rounded-[var(--pf-r3)] border border-transparent bg-[var(--pf-bg-surface)] px-[18px] py-3.5 text-left"
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={
                        on
                          ? "flex size-[26px] shrink-0 items-center justify-center rounded-full border border-[var(--pf-accent)] bg-[var(--pf-accent)] text-[var(--pf-on-accent)]"
                          : "flex size-[26px] shrink-0 items-center justify-center rounded-full border border-[var(--pf-border-strong)]"
                      }
                    >
                      {on ? <Icon name="check" size={13} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15.5px] font-semibold [text-wrap:pretty]">
                        {exercise.name}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-[var(--pf-text-3)]">
                        {exerciseTypeLabels[exercise.baseType]} ·{" "}
                        {exercise.allowedLoadModes.length}{" "}
                        {exercise.allowedLoadModes.length === 1
                          ? "mode"
                          : "modes"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Overlay>
  );
}

/** The previous performance of this exercise, set by set. */
export function LastTimeOverlay({
  trigger,
  exercise,
  currentSetPosition,
}: {
  trigger: ReactElement;
  exercise: WorkoutExercise;
  currentSetPosition: number;
}) {
  const last = exercise.lastPerformance;

  return (
    <Overlay
      title="Last time"
      trigger={trigger}
      footer={(close) => (
        <Action variant="secondary" className="h-14" onClick={() => close()}>
          Back to set
        </Action>
      )}
    >
      <h2 className="text-[22px] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
        {exercise.exerciseName}
      </h2>
      <p className="mt-2 mb-4.5 text-[13.5px] text-[var(--pf-text-3)]">
        {last === null
          ? "No previous performance"
          : `Last time · ${formatLastPerformanceDate(last.workoutDate)}`}
      </p>
      {last === null ? (
        <p className="rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] p-[18px] text-[14px] text-[var(--pf-text-3)]">
          No previous sets recorded for this exercise.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {last.sets.map((set, index) => {
            const current = index + 1 === currentSetPosition;
            return (
              <li
                key={`${set.position}-${index}`}
                className="flex min-h-16 items-center gap-3.5 rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] px-[18px]"
              >
                <span
                  className={
                    current
                      ? "pf-numeric w-4 text-[15px] font-semibold text-[var(--pf-accent)]"
                      : "pf-numeric w-4 text-[15px] font-semibold text-[var(--pf-text-4)]"
                  }
                >
                  {index + 1}
                </span>
                <span
                  className={
                    current
                      ? "pf-numeric flex-1 text-[20px] font-semibold text-[var(--pf-text)]"
                      : "pf-numeric flex-1 text-[20px] font-semibold text-[var(--pf-text-3)]"
                  }
                >
                  {formatWorkoutSetLine(set, exercise.measurementType)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Overlay>
  );
}

/** The snapshotted guidance, plus the note kept with this occurrence. */
export function NoteOverlay({
  trigger,
  exercise,
  onSave,
}: {
  trigger: ReactElement;
  exercise: WorkoutExercise;
  onSave: (note: string) => void;
}) {
  const [draft, setDraft] = useState(exercise.workoutNote);

  return (
    <Overlay
      title="Note"
      trigger={trigger}
      onOpenChange={(open) => {
        if (open) setDraft(exercise.workoutNote);
      }}
      footer={(close) => (
        <>
          <Action
            onClick={() => {
              if (draft !== exercise.workoutNote) onSave(draft);
              close();
            }}
          >
            <Icon name="check" size={19} />
            Save note
          </Action>
          <Action variant="secondary" onClick={() => close()}>
            Cancel
          </Action>
        </>
      )}
    >
      <h2 className="text-[22px] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
        {exercise.exerciseName}
      </h2>
      {exercise.persistentNote ? (
        <p className="mt-4 rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] p-[18px] text-[15.5px] leading-[1.5] text-[var(--pf-text-2)]">
          {exercise.persistentNote}
        </p>
      ) : (
        <p className="mt-4 rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] p-[18px] text-[15.5px] leading-[1.5] text-[var(--pf-text-3)]">
          No note for this exercise.
        </p>
      )}
      <p className="mt-5 mb-2 text-[13.5px] text-[var(--pf-text-3)]">
        Saved with this workout only.
      </p>
      <TextAreaField
        id={`workout-note-${exercise.id}`}
        label="Today's note"
        placeholder="Optional note for this occurrence"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    </Overlay>
  );
}

export type FinishOutcome = "completed" | "discarded";

/** The review the check action opens, read entirely from the client snapshot. */
export function ReviewFinishOverlay({
  open,
  onOpenChange,
  workout,
  clock,
  submitting,
  onFinish,
  onAskDiscard,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: CurrentWorkout;
  clock: string;
  submitting: boolean;
  onFinish: (outcome: FinishOutcome) => void;
  onAskDiscard: () => void;
}) {
  const recordedSets = workout.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.filter((set) => isSetRecorded(set.loadMode, set)).length,
    0,
  );
  const outstanding = workout.exercises.flatMap((exercise) =>
    exercise.plannedSets === null
      ? []
      : exercise.sets
          .filter(
            (set) =>
              set.position <= (exercise.plannedSets ?? 0) &&
              !isSetRecorded(set.loadMode, set),
          )
          .map((set) => `${exercise.exerciseName} set ${set.position}`),
  );

  return (
    <Overlay
      title="Review & finish"
      open={open}
      onOpenChange={onOpenChange}
      footer={(close) => (
        <>
          <Action disabled={submitting} onClick={() => onFinish("completed")}>
            <Icon name="check-check" size={19} />
            Complete workout
          </Action>
          <Action variant="secondary" onClick={() => close()}>
            Continue workout
          </Action>
          <button
            type="button"
            disabled={submitting}
            onClick={onAskDiscard}
            className="flex h-[var(--pf-size-secondary-action)] items-center justify-center rounded-full text-[15.5px] font-semibold text-[var(--pf-text-3)]"
          >
            Discard workout
          </button>
        </>
      )}
    >
      <h2 className="text-[22px] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
        {workout.name}
      </h2>
      <dl className="mt-4.5 grid grid-cols-3 gap-2">
        <FinishMetric label="Duration" value={clock} />
        <FinishMetric
          label="Exercises"
          value={String(workout.exercises.length)}
        />
        <FinishMetric label="Sets" value={String(recordedSets)} />
      </dl>
      {outstanding.length > 0 ? (
        <div className="mt-3 rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] px-[18px] py-3.5">
          <p className="flex items-center gap-2.5 text-[13.5px] font-medium text-[var(--pf-text-2)]">
            <Icon
              name="circle-alert"
              size={15}
              className="text-[var(--pf-text-3)]"
            />
            {outstanding.length} planned{" "}
            {outstanding.length === 1 ? "set" : "sets"} left without values
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-[13px] text-[var(--pf-text-3)]">
            {outstanding.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Overlay>
  );
}

function FinishMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] px-3 py-4 text-center">
      <dt className="text-[11px] font-semibold tracking-[0.06em] text-[var(--pf-text-4)] uppercase">
        {label}
      </dt>
      <dd className="pf-numeric mt-2 text-[length:var(--pf-type-metric-size)] font-bold">
        {value}
      </dd>
    </div>
  );
}
