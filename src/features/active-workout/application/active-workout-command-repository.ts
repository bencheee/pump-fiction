import type { ActiveWorkoutCommand } from "../domain/active-workout-command";

export type CommandApplicationRecord =
  | Readonly<{
      kind: "applied" | "duplicate";
      commandId: string;
      workoutId: string;
      expectedRevision: number;
      resultingRevision: number;
    }>
  | Readonly<{
      kind: "conflict";
      commandId: string;
      workoutId: string;
      expectedRevision: number;
      actualRevision: number;
    }>
  | Readonly<{ kind: "not_found" }>;

export interface ActiveWorkoutCommandRepository {
  apply(command: ActiveWorkoutCommand): Promise<CommandApplicationRecord>;
}

export class ActiveWorkoutCommandRepositoryError extends Error {
  readonly code: "constraint" | "unavailable" | "unexpected";

  constructor(
    code: "constraint" | "unavailable" | "unexpected",
    options?: ErrorOptions,
  ) {
    super("Active-workout command repository operation failed", options);
    this.name = "ActiveWorkoutCommandRepositoryError";
    this.code = code;
  }
}
