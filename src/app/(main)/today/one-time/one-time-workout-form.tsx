"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { startWorkoutAction } from "@/app/actions/workouts";
import type { Exercise } from "@/features/exercises/domain/exercise";
import { exerciseTypeLabels } from "@/features/exercises/ui/exercise-presentation";
import {
  Action,
  EmptyState,
  Icon,
  Sheet,
  StickyActionBar,
  TextField,
  TopBar,
} from "@/shared/ui";

export function OneTimeWorkoutForm({
  exercises,
}: {
  exercises: readonly Exercise[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<readonly Exercise[]>([]);
  const [nameError, setNameError] = useState<string>();
  const [exerciseError, setExerciseError] = useState<string>();
  const [startError, setStartError] = useState<string>();
  const [canRetry, setCanRetry] = useState(false);
  const [pending, setPending] = useState(false);

  function addExercise(exercise: Exercise) {
    if (selected.some((item) => item.id === exercise.id)) return;
    setSelected((current) => [...current, exercise]);
    setExerciseError(undefined);
    setStartError(undefined);
  }

  function removeExercise(id: string) {
    setSelected((current) => current.filter((item) => item.id !== id));
    setStartError(undefined);
  }

  function moveExercise(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= selected.length) return;
    const reordered = [...selected];
    [reordered[index], reordered[destination]] = [
      reordered[destination]!,
      reordered[index]!,
    ];
    setSelected(reordered);
    setStartError(undefined);
  }

  async function start() {
    const trimmedName = name.trim();
    const nextNameError = trimmedName
      ? undefined
      : "Enter a name for this workout.";
    const nextExerciseError =
      selected.length > 0
        ? undefined
        : "Add at least one exercise before starting.";
    setNameError(nextNameError);
    setExerciseError(nextExerciseError);
    if (nextNameError || nextExerciseError) return;

    setPending(true);
    setStartError(undefined);
    setCanRetry(false);
    const result = await startWorkoutAction({
      sourceKind: "one_time",
      name: trimmedName,
      exerciseIds: selected.map((exercise) => exercise.id),
      startedAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setNameError(result.error.fieldErrors?.name?.[0]);
      setExerciseError(result.error.fieldErrors?.exerciseIds?.[0]);
      setStartError(result.error.message);
      setCanRetry(result.error.retryable);
      setPending(false);
      return;
    }
    router.push("/workout/current");
  }

  const available = exercises.filter(
    (exercise) => !selected.some((item) => item.id === exercise.id),
  );

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title="One-Time Workout"
        backHref="/today"
        backLabel="Back to Today"
      />
      <main className="flex flex-1 flex-col px-[var(--pf-gutter)] pt-5">
        <div className="space-y-6">
          <TextField
            id="one-time-name"
            label="Workout name"
            placeholder="e.g. Quick Hotel Session"
            value={name}
            error={nameError}
            disabled={pending}
            autoComplete="off"
            className="min-h-[var(--pf-size-input-prominent)]"
            onChange={(event) => {
              setName(event.target.value);
              setNameError(undefined);
              setStartError(undefined);
            }}
          />

          <section aria-labelledby="one-time-exercises-title">
            <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
              <h2
                id="one-time-exercises-title"
                className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase"
              >
                <Icon name="dumbbell" size={18} /> Exercises
              </h2>
              <span className="pf-numeric text-[12.5px] text-[var(--pf-text-2)]">
                {selected.length}{" "}
                {selected.length === 1 ? "exercise" : "exercises"}
              </span>
            </div>

            {selected.length === 0 ? (
              <EmptyState
                title="No exercises yet"
                body="Add at least one exercise from your active library to start this workout."
              />
            ) : (
              <div className="space-y-2">
                {selected.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="flex min-h-24 items-center gap-2 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-2"
                  >
                    <Icon
                      name="grip-vertical"
                      size={18}
                      className="text-[var(--pf-text-3-deep)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16.5px] font-semibold [overflow-wrap:anywhere]">
                        {exercise.name}
                      </span>
                      <span className="mt-1 block text-[12.5px] text-[var(--pf-text-2)]">
                        {exerciseTypeLabels[exercise.baseType]} ·{" "}
                        {exercise.allowedLoadModes.length}{" "}
                        {exercise.allowedLoadModes.length === 1
                          ? "mode"
                          : "modes"}
                      </span>
                    </span>
                    <div className="flex shrink-0 flex-wrap justify-end">
                      <button
                        type="button"
                        aria-label={`Move ${exercise.name} up`}
                        disabled={pending || index === 0}
                        onClick={() => moveExercise(index, -1)}
                        className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="arrow-up" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${exercise.name} down`}
                        disabled={pending || index === selected.length - 1}
                        onClick={() => moveExercise(index, 1)}
                        className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="arrow-down" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${exercise.name}`}
                        disabled={pending}
                        onClick={() => removeExercise(exercise.id)}
                        className="flex size-11 items-center justify-center text-[var(--pf-text-2)] disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="x" size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Sheet
              title="Add Exercise"
              description="Choose from your active exercise library."
              trigger={
                <button
                  type="button"
                  data-invalid={exerciseError ? "true" : undefined}
                  aria-describedby={
                    exerciseError ? "one-time-exercises-error" : undefined
                  }
                  disabled={pending}
                  className="mt-3 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[var(--pf-r2)] border border-dashed border-[var(--pf-border-control)] font-semibold text-[var(--pf-accent-strong)] disabled:opacity-[var(--pf-opacity-disabled)] data-[invalid=true]:border-[var(--pf-danger)]"
                >
                  <Icon name="plus" size={18} /> Add Exercise
                </button>
              }
            >
              {available.length === 0 ? (
                <EmptyState
                  title={
                    exercises.length === 0
                      ? "No active exercises"
                      : "All exercises added"
                  }
                  body={
                    exercises.length === 0
                      ? "Create or reactivate an exercise in the library first."
                      : "Every active exercise is already in this workout."
                  }
                />
              ) : (
                <div className="space-y-2">
                  {available.map((exercise) => (
                    <button
                      key={exercise.id}
                      type="button"
                      aria-label={exercise.name}
                      onClick={() => addExercise(exercise)}
                      className="flex min-h-14 w-full items-center gap-3 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface)] px-3 py-2.5 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold [overflow-wrap:anywhere]">
                          {exercise.name}
                        </span>
                        <span className="mt-1 block text-[12.5px] text-[var(--pf-text-2)]">
                          {exerciseTypeLabels[exercise.baseType]}
                        </span>
                      </span>
                      <Icon
                        name="plus"
                        size={18}
                        className="text-[var(--pf-accent-strong)]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Sheet>
            {exerciseError ? (
              <p
                id="one-time-exercises-error"
                role="alert"
                className="mt-2 flex items-center gap-1 text-[12.5px] font-medium text-[var(--pf-danger)]"
              >
                <Icon name="triangle-alert" size={14} /> {exerciseError}
              </p>
            ) : null}
          </section>

          <p className="text-[12.5px] leading-[1.5] text-[var(--pf-text-3-deep)]">
            This workout is not linked to a split. It will count toward exercise
            progress, but not toward split duration statistics, and rotation
            will not change.
          </p>
        </div>

        <StickyActionBar className="-mx-[var(--pf-gutter)]">
          {startError ? (
            <div
              role="alert"
              className="flex min-h-11 items-center gap-2 text-[13px] text-[var(--pf-danger)]"
            >
              <Icon name="circle-x" size={14} />
              <span className="min-w-0 flex-1">{startError}</span>
              {canRetry ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void start()}
                  className="min-h-11 rounded-[var(--pf-r-pill)] border border-[var(--pf-danger)] px-3 font-semibold"
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : nameError || exerciseError ? (
            <div
              role="status"
              aria-live="polite"
              className="flex min-h-11 items-center gap-2 text-[13px] text-[var(--pf-danger)]"
            >
              <Icon name="triangle-alert" size={14} />{" "}
              {nameError ?? exerciseError}
            </div>
          ) : null}
          <Action disabled={pending} onClick={() => void start()}>
            {pending ? "Starting…" : "Start Workout"}
          </Action>
        </StickyActionBar>
      </main>
    </div>
  );
}
