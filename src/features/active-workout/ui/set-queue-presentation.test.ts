import { expect, it } from "vitest";
import { incrementLoadColumnFor } from "./set-queue-presentation";
import { validateExerciseDefinition } from "@/features/exercises/domain/exercise-validation";

it.each([1, 2, 2.5, 5, 10])(
  "offers %s kg increments and preserves off-grid values",
  (increment) => {
    expect(incrementLoadColumnFor(increment).slice(0, 4)).toEqual([
      0,
      increment,
      increment * 2,
      increment * 3,
    ]);
    expect(incrementLoadColumnFor(increment, 1.25)).toContain(1.25);
    expect(incrementLoadColumnFor(increment).at(-1)).toBe(200);
  },
);

it("avoids floating-point noise for fractional increments", () => {
  expect(incrementLoadColumnFor(0.1).slice(0, 4)).toEqual([0, 0.1, 0.2, 0.3]);
});

it.each([0, -1, 201, "", null, "unknown", 1.234, Infinity])(
  "rejects invalid increment %s",
  (weightIncrement) => {
    expect(
      validateExerciseDefinition({
        name: "Pull-up",
        baseType: "bodyweight",
        allowedLoadModes: ["bodyweight", "bodyweight_added_weight"],
        persistentNote: "",
        weightIncrement,
      }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { weightIncrement: expect.any(Array) },
    });
  },
);
