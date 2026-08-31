"use client";

import type { ActiveWorkoutCommandResult } from "../application/active-workout-command-result";
import type { ActiveWorkoutCommand } from "../domain/active-workout-command";

export interface ActiveWorkoutCommandTransport {
  deliver(command: ActiveWorkoutCommand): Promise<ActiveWorkoutCommandResult>;
}

export class FetchActiveWorkoutCommandTransport implements ActiveWorkoutCommandTransport {
  constructor(private readonly endpoint = "/api/active-workout/commands") {}

  async deliver(
    command: ActiveWorkoutCommand,
  ): Promise<ActiveWorkoutCommandResult> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
        cache: "no-store",
      });
      const result: unknown = await response.json();

      if (isCommandResult(result)) {
        return result;
      }
    } catch {
      // The persisted command remains pending and can be retried.
    }

    return {
      kind: "retry",
      code: "persistence",
      message: "We couldn't save the workout change. Try again.",
    };
  }
}

function isCommandResult(value: unknown): value is ActiveWorkoutCommandResult {
  if (!isRecord(value)) {
    return false;
  }

  if (value.kind === "acknowledged") {
    const acknowledgement = value.acknowledgement;
    return (
      isRecord(acknowledgement) &&
      typeof acknowledgement.commandId === "string" &&
      typeof acknowledgement.workoutId === "string" &&
      typeof acknowledgement.expectedRevision === "number" &&
      typeof acknowledgement.resultingRevision === "number" &&
      typeof acknowledgement.duplicate === "boolean"
    );
  }

  if (value.kind === "conflict") {
    const conflict = value.conflict;
    return (
      isRecord(conflict) &&
      typeof conflict.commandId === "string" &&
      typeof conflict.workoutId === "string" &&
      typeof conflict.expectedRevision === "number" &&
      typeof conflict.actualRevision === "number" &&
      conflict.recovery === "refresh_and_replay"
    );
  }

  if (value.kind === "rejected") {
    return (
      (value.code === "validation" || value.code === "not_found") &&
      typeof value.message === "string"
    );
  }

  return (
    value.kind === "retry" &&
    value.code === "persistence" &&
    typeof value.message === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
