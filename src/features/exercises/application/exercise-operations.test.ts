import { describe, expect, it, vi } from "vitest";

import {
  archiveExercise,
  createExercise,
  reactivateExercise,
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
  status: "active" as const,
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

  it("rejects more than one addition and a missing assistance mode", async () => {
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

    const noAssistance = await createExercise(repository, {
      name: "Assisted dip",
      baseType: "assisted",
      allowedLoadModes: [],
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
    expect(noAssistance).toMatchObject({
      ok: false,
      error: {
        fieldErrors: {
          allowedLoadModes: ["Choose exactly one assistance mode."],
        },
      },
    });
    expect(repository.create).not.toHaveBeenCalled();
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
          name: ["An active exercise already uses this name."],
        },
      },
    });
  });

  it("preserves identity while archiving and reactivating", async () => {
    const repository = createRepository();

    await archiveExercise(repository, exerciseId);
    await reactivateExercise(repository, exerciseId);

    expect(repository.setStatus).toHaveBeenNthCalledWith(
      1,
      exerciseId,
      "archived",
    );
    expect(repository.setStatus).toHaveBeenNthCalledWith(
      2,
      exerciseId,
      "active",
    );
  });

  it("rejects malformed identities before persistence", async () => {
    const repository = createRepository();

    const result = await archiveExercise(repository, "not-a-uuid");

    expect(result).toEqual({
      ok: false,
      error: {
        code: "not_found",
        message: "The requested exercise is no longer available.",
        retryable: false,
      },
    });
    expect(repository.setStatus).not.toHaveBeenCalled();
  });
});

function createRepository(): ExerciseRepository {
  return {
    list: vi.fn().mockResolvedValue([exercise]),
    getById: vi.fn().mockResolvedValue(exercise),
    create: vi.fn().mockResolvedValue(exercise),
    update: vi.fn().mockResolvedValue(exercise),
    setStatus: vi.fn().mockResolvedValue(exercise),
  };
}
