import { expect, it } from "vitest";
import { equipmentLoadColumnFor } from "./set-queue-presentation";
import { validateExerciseDefinition } from "@/features/exercises/domain/exercise-validation";

it("offers even dumbbell weights and preserves off-grid values", () => {
  const column = equipmentLoadColumnFor("dumbbells", 12.5, 6);
  expect(column.slice(0, 9)).toEqual([0, 2, 4, 6, 8, 10, 12, 12.5, 14]);
  expect(equipmentLoadColumnFor("standard").slice(0, 7)).toEqual([
    0, 2.5, 5, 7.5, 10, 12.5, 15,
  ]);
});

it("rejects dumbbell equipment on a bodyweight definition and unknown equipment", () => {
  for (const weightEquipment of ["dumbbells", "unknown"]) {
    expect(
      validateExerciseDefinition({
        name: "Pull-up",
        baseType: "bodyweight",
        allowedLoadModes: ["bodyweight"],
        persistentNote: "",
        weightEquipment,
      }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { weightEquipment: expect.any(Array) },
    });
  }
});
