"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState, useTransition } from "react";

import { correctHistoryWorkoutAction } from "@/app/actions/workout-history";
import { prescriptionText } from "@/features/active-workout/ui/set-queue-presentation";
import { formatSetChip } from "@/features/active-workout/ui/workout-presentation";
import type {
  HistoryWorkout,
  HistoryWorkoutExercise,
} from "@/features/history/domain/workout-history";
import {
  Action,
  ActionsPanel,
  Badge,
  DestructiveDialog,
  Icon,
  TopBar,
  useToast,
  useTransientOverlay,
} from "@/shared/ui";

import {
  formatCount,
  formatExerciseCount,
  formatHistoryDate,
  formatHistoryDuration,
  formatHistoryTime,
  localDateOf,
} from "../../history-presentation";
import "./workout-detail.css";

/*
 * The Workout detail screen — the prototype's screen 5 — ported for step 9 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 361-425, `data-screen-label="Workout detail"`
 *   bound values  lines 2062-2080 (`wdExercises`, `wdFacts`), 2196-2205
 *                 (`wdName`, `wdSub`, `wdDuration`, `wdPerformed`, `openEdit`,
 *                 `askDelete`), 2862-2871 (this screen's Actions entries),
 *                 2302-2308 (the dialog `askDelete` raises)
 *
 * The two surfaces the screen's one action button reaches — the Screen actions
 * panel (screen 17) and the confirm dialog (screen 33) — are shared and live
 * in `src/shared/ui`; the register in the plan records both as born here.
 */
export function WorkoutDetail({
  workout,
  timeZone,
}: {
  workout: HistoryWorkout;
  /*
   * The configured zone, read on the server. `toLocaleString()` would format
   * the two timestamps in the server's zone during the server render and in
   * the device's at hydration, and React would report the mismatch — the same
   * trap the workout clock fell into before step 5 baselined it on the
   * server's own reading.
   */
  timeZone: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [failure, setFailure] = useState<string>();
  /*
   * The prototype writes into its one `s.dialog` slot from the panel it has
   * just closed (`askDelete`, line 2204, and the Actions entry at 2869). Each
   * panel here carries its own history entry, so what an entry runs waits for
   * the Actions panel to give its entry back first — `pendingRef` in
   * `set-queue.tsx` is the same mechanism, step 6's.
   */
  const actionsOverlay = useTransientOverlay();
  const confirmOverlay = useTransientOverlay();
  const pendingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (actionsOverlay.open) return;
    const run = pendingRef.current;
    if (run === null) return;
    pendingRef.current = null;
    run();
  }, [actionsOverlay.open]);

  // `wdPerformed` (2199) counts every exercise in the saved workout; the
  // application counts the ones that hold a recorded set, which is what the
  // list row this screen was opened from already counts, and what the card
  // under it is labelled.
  const performed = workout.exercises.filter((exercise) =>
    exercise.sets.some((set) => set.loadMode !== null && set.reps !== null),
  ).length;

  const finishedOnAnotherDay =
    localDateOf(workout.finishedAt, timeZone) !==
    localDateOf(workout.startedAt, timeZone);

  // `wdFacts` (2073-2078). `Finished` is the saved timestamp rather than the
  // prototype's start plus duration: a workout that was paused finished later
  // than its active time says, and the application knows when.
  const facts = [
    {
      key: "started",
      label: "Started",
      value: `${formatHistoryDate(workout.workoutDate)}, ${formatHistoryTime(workout.startedAt, timeZone)}`,
    },
    {
      key: "finished",
      label: "Finished",
      value: finishedOnAnotherDay
        ? `${formatHistoryDate(localDateOf(workout.finishedAt, timeZone))}, ${formatHistoryTime(workout.finishedAt, timeZone)}`
        : formatHistoryTime(workout.finishedAt, timeZone),
    },
    {
      key: "split",
      label: "Split",
      value: workout.splitName ?? "One-time workout",
    },
    {
      key: "program",
      label: "Program",
      value: workout.programName ?? "Outside a program",
    },
  ];

  const deleteWorkout = () => {
    setFailure(undefined);
    startTransition(async () => {
      const result = await correctHistoryWorkoutAction({
        kind: "delete",
        workoutId: workout.id,
      });
      if (!result.ok) {
        setFailure(result.error.message);
        showToast(result.error.message);
        return;
      }
      showToast("Workout deleted. Affected statistics were recalculated.");
      router.push("/history/workouts");
      router.refresh();
    });
  };

  return (
    <div data-workout-detail="">
      <TopBar
        screen="workout-detail"
        title={workout.name}
        backHref="/history/workouts"
        backLabel="Back"
      />

      <div data-workout-detail-body="">
        <div>
          <h2 data-workout-detail-name="">{workout.name}</h2>
          <p data-workout-detail-sub="">
            {`${formatHistoryDate(workout.workoutDate)}${workout.programName === null ? "" : ` · ${workout.programName}`}`}
          </p>
        </div>

        <div data-workout-detail-stats="">
          <div data-workout-detail-stat="">
            <p>Active duration</p>
            <p>{formatHistoryDuration(workout.activeDurationSeconds)}</p>
          </div>
          <div data-workout-detail-stat="">
            <p>Performed</p>
            <p>{formatExerciseCount(performed)}</p>
          </div>
        </div>

        <div data-workout-detail-facts="">
          {facts.map((fact) => (
            <div key={fact.key} data-workout-detail-fact="">
              <span>{fact.label}</span>
              <span>{fact.value}</span>
            </div>
          ))}
        </div>

        <p data-workout-detail-eyebrow="">Exercises</p>

        {workout.exercises.length === 0 ? (
          // A saved workout with no exercises at all, which the prototype has
          // no notion of. The sentence goes in the note card the History list
          // answers an emptiness with.
          <p data-history-note="">This workout recorded no exercises.</p>
        ) : null}

        {workout.exercises.map((exercise, index) => (
          <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
        ))}
      </div>

      <div data-workout-detail-footer="">
        {failure ? (
          // A command that did not reach the server, which the prototype has
          // no notion of. It takes the card the Review & finish panel draws
          // its outstanding line in (line 1495), as step 6's delivery signals
          // do, and stays until the press is repeated.
          <p data-workout-detail-alert="" role="alert">
            <Icon name="circle-alert" size={15} />
            {failure}
          </p>
        ) : null}

        <ActionsPanel
          panel="workout-detail-actions"
          heading={workout.name}
          meta={[
            formatHistoryDate(workout.workoutDate),
            formatHistoryDuration(workout.activeDurationSeconds),
            formatExerciseCount(performed),
          ].join(" · ")}
          overlay={actionsOverlay}
          items={[
            {
              key: "edit",
              label: "Edit workout",
              icon: "pencil",
              run: () => {
                pendingRef.current = () =>
                  router.push(`/history/workouts/${workout.id}/edit`);
              },
            },
            {
              key: "delete",
              label: "Delete workout",
              icon: "trash-2",
              run: () => {
                pendingRef.current = () =>
                  confirmOverlay.requestOpenChange(true);
              },
            },
          ]}
          trigger={
            <Action
              variant="actions"
              aria-label="Actions"
              title="Actions"
              disabled={pending}
            >
              {"···"}
            </Action>
          }
        />
      </div>

      <DestructiveDialog
        overlay={confirmOverlay}
        title="Delete this workout?"
        description="It leaves History permanently and every statistic it fed is recalculated. Rotation is not affected."
        confirmLabel="Delete workout"
        onConfirm={deleteWorkout}
      />
    </div>
  );
}

/** `wdExercises` (lines 2062-2071). */
function ExerciseCard({
  exercise,
  index,
}: {
  exercise: HistoryWorkoutExercise;
  index: number;
}) {
  const prescription = prescriptionText(exercise);
  // `ex.planned` (2065) counts every set the workout holds and calls them
  // recorded; a saved workout here can hold a set that was never given values,
  // so this counts the ones that were.
  const recorded = exercise.sets.filter(
    (set) => set.loadMode !== null || set.reps !== null,
  ).length;
  const tally = `${formatCount(recorded, "set")} recorded`;

  return (
    <section
      data-workout-detail-exercise=""
      style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
    >
      <h3>{exercise.exerciseName}</h3>
      <p data-workout-detail-planned="">
        {prescription === null ? tally : `Planned ${prescription} · ${tally}`}
      </p>
      {exercise.stillInLibrary ? null : (
        <p data-workout-detail-retired="">
          <Badge>No longer in the library</Badge>
        </p>
      )}

      <ol data-workout-detail-sets="">
        {exercise.sets.map((set) => (
          <li key={set.id}>
            <span>Set {set.position}</span>
            <span>
              {set.loadMode === null && set.reps === null
                ? "No values"
                : formatSetChip(set, exercise.measurementType)}
            </span>
          </li>
        ))}
      </ol>

      {/* `ex.note` (2066) is the workout's own note on this exercise. The
          application also keeps the note that belongs to the definition, which
          the prototype has no notion of; both take the same card. */}
      {exercise.persistentNote ? (
        <p data-workout-detail-note="">
          Exercise note: {exercise.persistentNote}
        </p>
      ) : null}
      {exercise.workoutNote ? (
        <p data-workout-detail-note="">Workout note: {exercise.workoutNote}</p>
      ) : null}

      {/* `ex.openStats` (2069). A route rather than a press, so it is a link;
          and the prototype names all six of them `Open exercise statistics`,
          which says nothing about which one — the same reason step 5 gave the
          overview's remove button the exercise's name. */}
      <Link
        data-workout-detail-stats-link=""
        href={`/history/exercises/${exercise.exerciseIdentityId}`}
        aria-label={`Exercise statistics for ${exercise.exerciseName}`}
      >
        <Icon name="trending-up" size={15} />
        Exercise statistics
      </Link>
    </section>
  );
}
