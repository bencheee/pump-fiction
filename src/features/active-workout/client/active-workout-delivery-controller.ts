"use client";

import type {
  ActiveWorkoutAcknowledgement,
  ActiveWorkoutCommandResult,
  ActiveWorkoutConflict,
} from "../application/active-workout-command-result";
import type { ActiveWorkoutCommand } from "../domain/active-workout-command";
import type {
  ActiveWorkoutOutbox,
  PendingActiveWorkoutCommand,
} from "./active-workout-outbox";
import type { ActiveWorkoutCommandTransport } from "./active-workout-command-transport";

export type ActiveWorkoutSaveStatus =
  | Readonly<{ state: "saved"; pendingCount: 0 }>
  | Readonly<{ state: "saving"; pendingCount: number }>
  | Readonly<{
      state: "save_failed";
      pendingCount: number;
      message: string;
      recovery:
        | Readonly<{
            kind: "refresh_and_replay";
            conflict: ActiveWorkoutConflict;
            pendingCommands: readonly PendingActiveWorkoutCommand[];
          }>
        /**
         * The server refused this command for good, so it left the outbox and
         * will never be delivered again. The remaining commands are still
         * pending and recover exactly as they do after a conflict.
         */
        | Readonly<{
            kind: "discard_and_replay";
            discarded: ActiveWorkoutCommand;
            pendingCommands: readonly PendingActiveWorkoutCommand[];
          }>
        | Readonly<{ kind: "retry_delivery" }>;
    }>;

export type DeliveryResult =
  | Readonly<{
      kind: "drained";
      acknowledgements: readonly ActiveWorkoutAcknowledgement[];
    }>
  | Readonly<{
      kind: "stopped";
      result: Exclude<ActiveWorkoutCommandResult, { kind: "acknowledged" }>;
    }>;

type StatusListener = (status: ActiveWorkoutSaveStatus) => void;

export class ActiveWorkoutDeliveryController {
  private activeFlush?: Promise<DeliveryResult>;
  private readonly listeners = new Set<StatusListener>();
  private status: ActiveWorkoutSaveStatus = { state: "saved", pendingCount: 0 };

  constructor(
    private readonly outbox: ActiveWorkoutOutbox,
    private readonly transport: ActiveWorkoutCommandTransport,
  ) {}

  getStatus(): ActiveWorkoutSaveStatus {
    return this.status;
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  async enqueue(command: ActiveWorkoutCommand): Promise<void> {
    await this.outbox.enqueue(command);
    const pending = await this.outbox.list();
    this.setStatus({ state: "saving", pendingCount: pending.length });
    void this.flush();
  }

  flush(): Promise<DeliveryResult> {
    if (this.activeFlush !== undefined) {
      return this.activeFlush;
    }

    const flush = this.runFlush();
    this.activeFlush = flush;
    const clearActiveFlush = (): void => {
      if (this.activeFlush === flush) {
        this.activeFlush = undefined;
      }
    };
    void flush.then(clearActiveFlush, clearActiveFlush);
    return flush;
  }

  private async runFlush(): Promise<DeliveryResult> {
    const acknowledgements: ActiveWorkoutAcknowledgement[] = [];

    while (true) {
      const pendingCommands = await this.outbox.list();
      const next = pendingCommands[0];

      if (next === undefined) {
        this.setStatus({ state: "saved", pendingCount: 0 });
        return { kind: "drained", acknowledgements };
      }

      this.setStatus({
        state: "saving",
        pendingCount: pendingCommands.length,
      });

      const result = await this.transport.deliver(next.command);

      if (
        result.kind === "acknowledged" &&
        acknowledgementMatches(result.acknowledgement, next.command)
      ) {
        await this.outbox.remove(next.command.commandId);
        acknowledgements.push(result.acknowledgement);
        continue;
      }

      const stoppedResult =
        result.kind === "acknowledged"
          ? invalidAcknowledgementResult()
          : result;

      // A rejection is terminal: retrying it would only block every command
      // behind it, so it leaves the outbox before the status is reported.
      if (stoppedResult.kind === "rejected") {
        await this.outbox.remove(next.command.commandId);
      }

      const currentPending = await this.outbox.list();

      this.setStatus({
        state: "save_failed",
        pendingCount: currentPending.length,
        message:
          stoppedResult.kind === "conflict"
            ? "The workout changed. Refresh it and replay pending changes."
            : stoppedResult.message,
        recovery:
          stoppedResult.kind === "conflict"
            ? {
                kind: "refresh_and_replay",
                conflict: stoppedResult.conflict,
                pendingCommands: currentPending,
              }
            : stoppedResult.kind === "rejected"
              ? {
                  kind: "discard_and_replay",
                  discarded: next.command,
                  pendingCommands: currentPending,
                }
              : { kind: "retry_delivery" },
      });

      return { kind: "stopped", result: stoppedResult };
    }
  }

  private setStatus(status: ActiveWorkoutSaveStatus): void {
    this.status = status;
    for (const listener of this.listeners) {
      listener(status);
    }
  }
}

function acknowledgementMatches(
  acknowledgement: ActiveWorkoutAcknowledgement,
  command: ActiveWorkoutCommand,
): boolean {
  return (
    acknowledgement.commandId === command.commandId &&
    acknowledgement.workoutId === command.workoutId &&
    acknowledgement.expectedRevision === command.expectedRevision &&
    acknowledgement.resultingRevision === command.expectedRevision + 1
  );
}

function invalidAcknowledgementResult(): Extract<
  ActiveWorkoutCommandResult,
  { kind: "retry" }
> {
  return {
    kind: "retry",
    code: "persistence",
    message: "The save acknowledgement was invalid. Try again.",
  };
}
