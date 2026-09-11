import { describe, expect, it, vi } from "vitest";

import {
  createExercise,
  deleteExercise,
  updateExercise,
} from "./exercise-operations";
import {
  ExerciseRepositoryError,
  type ExerciseRepository,
} from "./exercise-repository";

const exerciseId = "123e4567-e89b-42d3-a456-426614174000";
const exercise = {
  id: exerciseId,
  name: "Pull-up",
  baseType: "bodyweight" as const,
  allowedLoadModes: ["bodyweight", "bodyweight_added_weight"] as const,
  persistentNote: "Keep the ribs down.",
  splitUsageCount: 2,
};

describe("exercise operations", () => {
  it("normalizes a valid definition before creating it", async () => {
    const repository = createRepository();

    const result = await createExercise(repository, {
      name: "  Pull-up  ",
      baseType: "bodyweight",
      allowedLoadModes: ["bodyweight", "bodyweight_added_weight"],
      persistentNote: "Keep the ribs down.",
    });

    expect(repository.create).toHaveBeenCalledWith({
      name: "Pull-up",
      baseType: "bodyweight",
      measurementType: "reps",
      allowedLoadModes: ["bodyweight", "bodyweight_added_weight"],
      persistentNote: "Keep the ribs down.",
    });
    expect(result).toEqual({ ok: true, value: exercise });
  });

  it("rejects incompatible and incomplete definitions before persistence", async () => {
    const repository = createRepository();

    const result = await createExercise(repository, {
      name: " ",
      baseType: "weights",
      allowedLoadModes: ["assistance_band"],
      persistentNote: "",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "validation",
        message: "Check the submitted values and try again.",
        retryable: false,
        fieldErrors: {
          name: ["Enter a name for this exercise."],
          allowedLoadModes: [
            "Select only load modes supported by this exercise type.",
          ],
        },
      },
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects more than one addition and the retired assisted type", async () => {
    const repository = createRepository();

    const bothAdditions = await createExercise(repository, {
      name: "Pull-up",
      baseType: "bodyweight",
      allowedLoadModes: [
        "bodyweight",
        "bodyweight_added_weight",
        "bodyweight_resistance_band",
      ],
      persistentNote: "",
    });

    const assistanceAndBand = await createExercise(repository, {
      name: "Assisted dip",
      baseType: "bodyweight",
      measurementType: "reps",
      allowedLoadModes: ["bodyweight", "assistance_weight", "assistance_band"],
      persistentNote: "",
    });

    const retiredType = await createExercise(repository, {
      name: "Assisted pull-up",
      baseType: "assisted",
      allowedLoadModes: ["assistance_weight"],
      persistentNote: "",
    });

    expect(bothAdditions).toMatchObject({
      ok: false,
      error: {
        fieldErrors: {
          allowedLoadModes: ["Choose at most one additional mode."],
        },
      },
    });
    expect(assistanceAndBand).toMatchObject({
      ok: false,
      error: {
        fieldErrors: {
          allowedLoadModes: ["Choose at most one additional mode."],
        },
      },
    });
    expect(retiredType).toMatchObject({
      ok: false,
      error: { fieldErrors: { baseType: ["Choose an exercise type."] } },
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("accepts a bodyweight exercise that assists with weight", async () => {
    const repository = createRepository();

    const result = await createExercise(repository, {
      name: "Assisted dip",
      baseType: "bodyweight",
      allowedLoadModes: ["bodyweight", "assistance_weight"],
      persistentNote: "",
    });

    expect(result.ok).toBe(true);
    expect(repository.create).toHaveBeenCalledWith({
      name: "Assisted dip",
      baseType: "bodyweight",
      measurementType: "reps",
      allowedLoadModes: ["bodyweight", "assistance_weight"],
      persistentNote: "",
    });
  });

  it("maps a duplicate active name to the accepted name error", async () => {
    const repository = createRepository();
    vi.mocked(repository.update).mockRejectedValue(
      new ExerciseRepositoryError("duplicate_name"),
    );

    const result = await updateExercise(repository, exerciseId, {
      name: "Pull-up",
      baseType: "bodyweight",
      allowedLoadModes: ["bodyweight"],
      persistentNote: "",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "validation",
        message: "Check the submitted values and try again.",
        retryable: false,
        fieldErrors: {
          name: ["Another exercise already uses this name."],
        },
      },
    });
  });

  it("deletes an exercise by its identity", async () => {
    const repository = createRepository();

    const result = await deleteExercise(repository, exerciseId);

    expect(repository.delete).toHaveBeenCalledWith(exerciseId);
    expect(result).toEqual({ ok: true, value: null });
  });

  it("rejects malformed identities before persistence", async () => {
    const repository = createRepository();

    const result = await deleteExercise(repository, "not-a-uuid");

    expect(result).toEqual({
      ok: false,
      error: {
        code: "not_found",
        message: "The requested exercise is no longer available.",
        retryable: false,
      },
    });
    expect(repository.delete).not.toHaveBeenCalled();
  });
});

function createRepository(): ExerciseRepository {
  return {
    list: vi.fn().mockResolvedValue([exercise]),
    getById: vi.fn().mockResolvedValue(exercise),
    create: vi.fn().mockResolvedValue(exercise),
    update: vi.fn().mockResolvedValue(exercise),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}
