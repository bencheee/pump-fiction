"use client";

import type { ActiveWorkoutCommand } from "../domain/active-workout-command";
import type {
  ActiveWorkoutOutbox,
  PendingActiveWorkoutCommand,
} from "./active-workout-outbox";

export type ActiveWorkoutRestoreResult<State> = Readonly<{
  authoritative: State;
  optimistic: State;
  pendingCommands: readonly PendingActiveWorkoutCommand[];
}>;

export async function restoreActiveWorkout<State>(
  workoutId: string,
  outbox: ActiveWorkoutOutbox,
  loadAuthoritative: () => Promise<State>,
  replay: (state: State, command: ActiveWorkoutCommand) => State,
): Promise<ActiveWorkoutRestoreResult<State>> {
  const authoritative = await loadAuthoritative();
  const pendingCommands = await outbox.list(workoutId);
  const optimistic = pendingCommands.reduce<State>(
    (state, pending) => replay(state, pending.command),
    authoritative,
  );

  return { authoritative, optimistic, pendingCommands };
}
