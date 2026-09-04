"use client";

import { applyCommandToWorkout } from "../domain/apply-command-to-workout";
import type { ActiveWorkoutCommand } from "../domain/active-workout-command";
import type { CurrentWorkout } from "../domain/workout";
import type { ActiveWorkoutOutbox } from "./active-workout-outbox";
import { newCommandId } from "./command-id";

export type RebaseResult = Readonly<{
  workout: CurrentWorkout;
  placeholderIds: ReadonlySet<string>;
}>;

export function isStructuralCommand(command: ActiveWorkoutCommand): boolean {
  return (
    command.operation === "add_set" || command.operation === "add_exercise"
  );
}

/**
 * Conflict recovery: keep the authoritative refreshed workout and replay the
 * retained FIFO commands as fresh envelopes rebased onto its revision. The
 * original command IDs are consumed server-side idempotency evidence, so a
 * rebased replay must not reuse them with a different expected revision.
 */
export async function rebasePendingCommands(
  outbox: ActiveWorkoutOutbox,
  authoritative: CurrentWorkout,
): Promise<RebaseResult> {
  const pending = await outbox.list(authoritative.id);
  let workout = authoritative;
  const placeholderIds = new Set<string>();

  for (const { command } of pending) {
    await outbox.remove(command.commandId);
    const rebased = {
      ...command,
      commandId: newCommandId(),
      expectedRevision: workout.revision,
    } as ActiveWorkoutCommand;
    await outbox.enqueue(rebased);
    workout = applyCommandToWorkout(workout, rebased);
    if (isStructuralCommand(rebased)) placeholderIds.add(rebased.commandId);
  }

  return { workout, placeholderIds };
}
