import type { FieldErrors } from "@/shared/application/operation-result";

export type ActiveWorkoutAcknowledgement = Readonly<{
  commandId: string;
  workoutId: string;
  expectedRevision: number;
  resultingRevision: number;
  duplicate: boolean;
}>;

export type ActiveWorkoutConflict = Readonly<{
  commandId: string;
  workoutId: string;
  expectedRevision: number;
  actualRevision: number;
  recovery: "refresh_and_replay";
}>;

export type ActiveWorkoutCommandResult =
  | Readonly<{
      kind: "acknowledged";
      acknowledgement: ActiveWorkoutAcknowledgement;
    }>
  | Readonly<{ kind: "conflict"; conflict: ActiveWorkoutConflict }>
  | Readonly<{
      kind: "rejected";
      code: "validation" | "not_found";
      message: string;
      fieldErrors?: FieldErrors;
    }>
  | Readonly<{
      kind: "retry";
      code: "persistence";
      message: string;
    }>;
