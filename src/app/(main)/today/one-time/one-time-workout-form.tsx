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
    // `startOneTime` (line 3326) lands on the overview, as a split start does.
    router.push("/workout/current?view=overview");
  }

  const available = exercises.filter(
    (exercise) => !selected.some((item) => item.id === exercise.id),
  );

  return (
    <div>
      <TopBar
        title="One-Time Workout"
        backHref="/today"
        backLabel="Back to Today"
      />
      <main>
        <div>
          <TextField
            id="one-time-name"
            label="Workout name"
            placeholder="e.g. Quick Hotel Session"
            value={name}
            error={nameError}
            disabled={pending}
            autoComplete="off"
            onChange={(event) => {
              setName(event.target.value);
              setNameError(undefined);
              setStartError(undefined);
            }}
          />

          <section aria-labelledby="one-time-exercises-title">
            <div>
              <h2 id="one-time-exercises-title">
                <Icon name="dumbbell" size={18} /> Exercises
              </h2>
              <span>
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
              <div>
                {selected.map((exercise, index) => (
                  <div key={exercise.id}>
                    <Icon name="grip-vertical" size={18} />
                    <span>
                      <span>{exercise.name}</span>
                      <span>
                        {exerciseTypeLabels[exercise.baseType]} ·{" "}
                        {exercise.allowedLoadModes.length}{" "}
                        {exercise.allowedLoadModes.length === 1
                          ? "mode"
                          : "modes"}
                      </span>
                    </span>
                    <div>
                      <button
                        type="button"
                        aria-label={`Move ${exercise.name} up`}
                        disabled={pending || index === 0}
                        onClick={() => moveExercise(index, -1)}
                      >
                        <Icon name="arrow-up" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${exercise.name} down`}
                        disabled={pending || index === selected.length - 1}
                        onClick={() => moveExercise(index, 1)}
                      >
                        <Icon name="arrow-down" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${exercise.name}`}
                        disabled={pending}
                        onClick={() => removeExercise(exercise.id)}
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
                <div>
                  {available.map((exercise) => (
                    <button
                      key={exercise.id}
                      type="button"
                      aria-label={exercise.name}
                      onClick={() => addExercise(exercise)}
                    >
                      <span>
                        <span>{exercise.name}</span>
                        <span>{exerciseTypeLabels[exercise.baseType]}</span>
                      </span>
                      <Icon name="plus" size={18} />
                    </button>
                  ))}
                </div>
              )}
            </Sheet>
            {exerciseError ? (
              <p id="one-time-exercises-error" role="alert">
                <Icon name="triangle-alert" size={14} /> {exerciseError}
              </p>
            ) : null}
          </section>

          <p>
            This workout is not linked to a split. It will count toward exercise
            progress, but not toward split duration statistics, and rotation
            will not change.
          </p>
        </div>

        <StickyActionBar>
          {startError ? (
            <div role="alert">
              <Icon name="circle-x" size={14} />
              <span>{startError}</span>
              {canRetry ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void start()}
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : nameError || exerciseError ? (
            <div role="status" aria-live="polite">
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
