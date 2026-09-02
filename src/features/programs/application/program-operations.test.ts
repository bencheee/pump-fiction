import { describe, expect, it } from "vitest";

import type { ProgramDefinition } from "../domain/program";
import { ProgramRepositoryError } from "./program-repository";
import {
  archiveSplit,
  createProgram,
  createSplit,
  reorderSplits,
} from "./program-operations";
import type { ProgramRepository } from "./program-repository";

const programId = "10000000-0000-4000-8000-000000000001";
const exerciseId = "20000000-0000-4000-8000-000000000001";

describe("program operations", () => {
  it("normalizes program names before persistence", async () => {
    let savedName = "";
    const repository = {
      createProgram: async (definition: ProgramDefinition) => {
        savedName = definition.name;
        return {
          id: programId,
          name: definition.name,
          status: "draft",
          nextSplitId: null,
          splits: [],
        };
      },
    } as unknown as ProgramRepository;

    const result = await createProgram(repository, { name: "  Strength  " });

    expect(result.ok).toBe(true);
    expect(savedName).toBe("Strength");
  });

  it("returns field-shaped split prescription errors without persistence", async () => {
    const result = await createSplit({} as ProgramRepository, programId, {
      name: "Push",
      exercises: [
        {
          exerciseId,
          plannedSets: 0,
          minReps: 12,
          maxReps: 8,
        },
        {
          exerciseId,
          plannedSets: 3,
          minReps: 8,
          maxReps: 12,
        },
      ],
    });

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({
        code: "validation",
        fieldErrors: expect.objectContaining({
          "exercises.0.plannedSets": expect.any(Array),
          "exercises.0.maxReps": expect.any(Array),
          "exercises.1.exerciseId": expect.any(Array),
        }),
      }),
    });
  });

  it("rejects malformed or duplicate reorder identities before persistence", async () => {
    const result = await reorderSplits({} as ProgramRepository, programId, [
      exerciseId,
      exerciseId,
    ]);

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({
        code: "validation",
        fieldErrors: { order: expect.any(Array) },
      }),
    });
  });

  it("translates the last-active-split invariant to a stable failure", async () => {
    const repository = {
      archiveSplit: async () => {
        throw new ProgramRepositoryError("last_active_split");
      },
    } as unknown as ProgramRepository;

    const result = await archiveSplit(repository, programId);

    expect(result).toEqual({
      ok: false,
      error: {
        code: "validation",
        message: "At least one active split must remain in the program.",
        retryable: false,
      },
    });
  });
});
