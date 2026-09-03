import type { StartWorkoutDefinition, StartWorkoutInput } from "./workout";

type Result =
  | Readonly<{ ok: true; value: StartWorkoutDefinition }>
  | Readonly<{
      ok: false;
      fieldErrors: Readonly<Record<string, readonly string[]>>;
    }>;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateStartWorkout(input: StartWorkoutInput): Result {
  const startedAt =
    typeof input.startedAt === "string" &&
    Number.isFinite(Date.parse(input.startedAt))
      ? input.startedAt
      : null;
  if (startedAt === null)
    return failure("startedAt", "Provide a valid workout start timestamp.");
  if (
    input.sourceKind === "proposed_split" ||
    input.sourceKind === "alternate_split"
  ) {
    if (typeof input.splitId !== "string" || !uuidPattern.test(input.splitId))
      return failure("splitId", "Choose an available split.");
    return {
      ok: true,
      value: {
        sourceKind: input.sourceKind,
        splitId: input.splitId,
        startedAt,
      },
    };
  }
  if (input.sourceKind === "one_time") {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (name.length === 0) return failure("name", "Enter a workout name.");
    if (
      !Array.isArray(input.exerciseIds) ||
      input.exerciseIds.length === 0 ||
      input.exerciseIds.some(
        (id) => typeof id !== "string" || !uuidPattern.test(id),
      ) ||
      new Set(input.exerciseIds).size !== input.exerciseIds.length
    )
      return failure("exerciseIds", "Choose each active exercise once.");
    return {
      ok: true,
      value: {
        sourceKind: "one_time",
        name,
        exerciseIds: input.exerciseIds as string[],
        startedAt,
      },
    };
  }
  return failure("sourceKind", "Choose how to start the workout.");
}

function failure(
  field: string,
  message: string,
): Extract<Result, { ok: false }> {
  return { ok: false, fieldErrors: { [field]: [message] } };
}
