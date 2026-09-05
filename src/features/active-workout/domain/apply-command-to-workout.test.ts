import { describe, expect, it } from "vitest";

import { applyCommandToWorkout } from "./apply-command-to-workout";
import type { ActiveWorkoutCommand } from "./active-workout-command";
import {
  changeSetMode,
  isSetRecorded,
  missingSetValues,
  setModeFields,
} from "./set-entry";
import type { CurrentWorkout, WorkoutSet } from "./workout";
import { exerciseLoadModes } from "@/features/exercises/domain/exercise";

const workoutId = "00000000-0000-4000-8000-00000000000a";
const exerciseOne = "00000000-0000-4000-8000-00000000000b";
const exerciseTwo = "00000000-0000-4000-8000-00000000000c";
const setOne = "00000000-0000-4000-8000-00000000000d";
const setTwo = "00000000-0000-4000-8000-00000000000e";

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

function makeWorkout(): CurrentWorkout {
  return {
    id: workoutId,
    status: "active",
    sourceKind: "proposed_split",
    sourceProgramId: null,
    sourceSplitId: null,
    name: "Lower Body",
    workoutDate: "2026-09-04",
    startedAt: "2026-09-04T10:00:00.000Z",
    accumulatedActiveSeconds: 120,
    activeSegmentStartedAt: "2026-09-04T10:02:00.000Z",
    revision: 4,
    exercises: [
      {
        id: exerciseOne,
        exerciseId: "00000000-0000-4000-8000-0000000000f1",
        position: 1,
        exerciseName: "Squat",
        exerciseBaseType: "weights",
        allowedLoadModes: ["weight", "weight_resistance_band"],
        persistentNote: "Brace hard.",
        plannedSets: 3,
        minReps: 5,
        maxReps: 8,
        workoutNote: "",
        sets: [
          makeSet({
            id: setOne,
            position: 1,
            loadMode: "weight",
            loadKg: 82.5,
            reps: 6,
          }),
          makeSet({ id: setTwo, position: 2, loadMode: "weight" }),
        ],
        lastPerformance: null,
      },
      {
        id: exerciseTwo,
        exerciseId: "00000000-0000-4000-8000-0000000000f2",
        position: 2,
        exerciseName: "Pull-Up",
        exerciseBaseType: "bodyweight",
        allowedLoadModes: [
          "bodyweight",
          "bodyweight_added_weight",
          "bodyweight_resistance_band",
        ],
        persistentNote: "",
        plannedSets: null,
        minReps: null,
        maxReps: null,
        workoutNote: "",
        sets: [],
        lastPerformance: null,
      },
    ],
  };
}

function command(
  operation: ActiveWorkoutCommand["operation"],
  payload: ActiveWorkoutCommand["payload"],
  commandId = "00000000-0000-4000-8000-000000000c01",
): ActiveWorkoutCommand {
  return {
    commandId,
    workoutId,
    expectedRevision: 4,
    operation,
    payload,
    clientCreatedAt: "2026-09-04T10:10:00.000Z",
  } as ActiveWorkoutCommand;
}

describe("applyCommandToWorkout", () => {
  it("replaces the complete set payload and bumps the revision", () => {
    const next = applyCommandToWorkout(
      makeWorkout(),
      command("update_set", {
        workoutSetId: setTwo,
        loadMode: "weight",
        loadKg: 90,
        bandDirection: null,
        bandStrength: null,
        reps: 5,
      }),
    );
    const set = next.exercises[0]!.sets[1]!;
    expect(set).toMatchObject({ loadKg: 90, reps: 5 });
    expect(isSetRecorded(set.loadMode, set)).toBe(true);
    expect(next.revision).toBe(5);
  });

  it("pauses by accumulating the active segment and resumes a new one", () => {
    const paused = applyCommandToWorkout(
      makeWorkout(),
      command("pause_timer", {
        transitionedAt: "2026-09-04T10:03:30.000Z",
      }),
    );
    expect(paused.status).toBe("paused");
    expect(paused.accumulatedActiveSeconds).toBe(210);
    expect(paused.activeSegmentStartedAt).toBeNull();

    const resumed = applyCommandToWorkout(
      paused,
      command("resume_timer", {
        transitionedAt: "2026-09-04T10:15:00.000Z",
      }),
    );
    expect(resumed.status).toBe("active");
    expect(resumed.activeSegmentStartedAt).toBe("2026-09-04T10:15:00.000Z");
    expect(resumed.accumulatedActiveSeconds).toBe(210);
  });

  it("adds a synthetic placeholder set with the command identity", () => {
    const next = applyCommandToWorkout(
      makeWorkout(),
      command(
        "add_set",
        { workoutExerciseId: exerciseOne },
        "00000000-0000-4000-8000-000000000c02",
      ),
    );
    const sets = next.exercises[0]!.sets;
    expect(sets).toHaveLength(3);
    expect(sets[2]).toMatchObject({
      id: "00000000-0000-4000-8000-000000000c02",
      position: 3,
      loadMode: null,
      reps: null,
    });
  });

  it("removes sets and exercises with compacted positions", () => {
    const withoutSet = applyCommandToWorkout(
      makeWorkout(),
      command("remove_set", {
        workoutSetId: setOne,
        confirmedPopulatedRemoval: true,
      }),
    );
    expect(withoutSet.exercises[0]!.sets).toHaveLength(1);
    expect(withoutSet.exercises[0]!.sets[0]).toMatchObject({
      id: setTwo,
      position: 1,
    });

    const withoutExercise = applyCommandToWorkout(
      makeWorkout(),
      command("remove_exercise", {
        workoutExerciseId: exerciseOne,
        confirmedPopulatedRemoval: true,
      }),
    );
    expect(withoutExercise.exercises).toHaveLength(1);
    expect(withoutExercise.exercises[0]).toMatchObject({
      id: exerciseTwo,
      position: 1,
    });
  });

  it("appends an added exercise placeholder without set rows", () => {
    const next = applyCommandToWorkout(
      makeWorkout(),
      command(
        "add_exercise",
        { exerciseId: "00000000-0000-4000-8000-0000000000f3" },
        "00000000-0000-4000-8000-000000000c03",
      ),
    );
    expect(next.exercises).toHaveLength(3);
    expect(next.exercises[2]).toMatchObject({
      id: "00000000-0000-4000-8000-000000000c03",
      position: 3,
      plannedSets: null,
      sets: [],
    });
  });

  it("reorders exercises by the delivered identity order", () => {
    const next = applyCommandToWorkout(
      makeWorkout(),
      command("reorder_exercises", {
        workoutExerciseIds: [exerciseTwo, exerciseOne],
      }),
    );
    expect(next.exercises.map((item) => item.id)).toEqual([
      exerciseTwo,
      exerciseOne,
    ]);
    expect(next.exercises.map((item) => item.position)).toEqual([1, 2]);
  });

  it("ignores commands addressed to another workout", () => {
    const workout = makeWorkout();
    const next = applyCommandToWorkout(workout, {
      ...command("pause_timer", { transitionedAt: "2026-09-04T10:03:30.000Z" }),
      workoutId: "00000000-0000-4000-8000-0000000000ff",
    } as ActiveWorkoutCommand);
    expect(next).toBe(workout);
  });
});

describe("set entry rules", () => {
  it("defines applicable fields and required values for every load mode", () => {
    const emptySet = { loadKg: null, bandStrength: null, reps: null };
    const expected: Record<string, readonly string[]> = {
      weight: ["kg", "reps"],
      weight_resistance_band: ["kg", "band strength", "reps"],
      bodyweight: ["reps"],
      bodyweight_added_weight: ["added kg", "reps"],
      bodyweight_resistance_band: ["band strength", "reps"],
      assistance_weight: ["assistance kg", "reps"],
      assistance_band: ["band strength", "reps"],
    };
    for (const mode of exerciseLoadModes) {
      expect(missingSetValues(mode, emptySet)).toEqual(expected[mode]);
      expect(isSetRecorded(mode, emptySet)).toBe(false);
      const fields = setModeFields[mode];
      expect(
        fields.band === null ||
          fields.band === "resistance" ||
          fields.band === "assistance",
      ).toBe(true);
    }
  });

  it("keeps compatible values on a mode change and names what was cleared", () => {
    const kept = changeSetMode(
      makeSet({
        id: setOne,
        loadMode: "weight",
        loadKg: 82.5,
        reps: 6,
      }),
      "weight_resistance_band",
    );
    expect(kept.set).toMatchObject({
      loadMode: "weight_resistance_band",
      loadKg: 82.5,
      reps: 6,
      bandDirection: "resistance",
    });
    expect(isSetRecorded(kept.set.loadMode, kept.set)).toBe(false);
    expect(kept.clearedLabels).toEqual([]);

    const cleared = changeSetMode(
      makeSet({
        id: setOne,
        loadMode: "bodyweight_added_weight",
        loadKg: 5,
        reps: 8,
      }),
      "bodyweight_resistance_band",
    );
    expect(cleared.set).toMatchObject({
      loadKg: null,
      reps: 8,
      bandDirection: "resistance",
    });
    expect(cleared.clearedLabels).toEqual(["added kg"]);
  });
});
