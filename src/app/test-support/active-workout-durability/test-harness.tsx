"use client";

import { useEffect, useState } from "react";

import type { ActiveWorkoutCommandResult } from "@/features/active-workout/application/active-workout-command-result";
import type { ActiveWorkoutCommand } from "@/features/active-workout/domain/active-workout-command";
import type { ActiveWorkoutCommandTransport } from "@/features/active-workout/client/active-workout-command-transport";
import {
  ActiveWorkoutDeliveryController,
  type ActiveWorkoutSaveStatus,
} from "@/features/active-workout/client/active-workout-delivery-controller";
import { IndexedDbActiveWorkoutOutbox } from "@/features/active-workout/client/active-workout-outbox";

const workoutId = "00000000-0000-4000-8000-000000000001";
const workoutExerciseId = "00000000-0000-4000-8000-000000000002";

export function ActiveWorkoutDurabilityHarness() {
  const [controller] = useState(
    () =>
      new ActiveWorkoutDeliveryController(
        new IndexedDbActiveWorkoutOutbox(),
        new HarnessTransport(),
      ),
  );
  const [status, setStatus] = useState<ActiveWorkoutSaveStatus>(
    controller.getStatus(),
  );
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const unsubscribe = controller.subscribe(setStatus);
    void controller.flush();
    return unsubscribe;
  }, [controller]);

  async function enqueue(): Promise<void> {
    const command: ActiveWorkoutCommand = {
      commandId: crypto.randomUUID(),
      workoutId,
      expectedRevision: revision,
      operation: "set_workout_exercise_note",
      payload: { workoutExerciseId, note: `Pending note ${revision + 1}` },
      clientCreatedAt: new Date().toISOString(),
    };

    appendLog("enqueued", command.commandId);
    setRevision((current) => current + 1);
    await controller.enqueue(command);
  }

  return (
    <main>
      <p data-testid="save-state">{status.state}</p>
      <p data-testid="pending-count">{status.pendingCount}</p>
      <p data-testid="recovery">
        {status.state === "save_failed" ? status.recovery.kind : "none"}
      </p>
      <button type="button" onClick={() => void enqueue()}>
        Enqueue command
      </button>
      <button type="button" onClick={() => void controller.flush()}>
        Retry delivery
      </button>
    </main>
  );
}

class HarnessTransport implements ActiveWorkoutCommandTransport {
  async deliver(
    command: ActiveWorkoutCommand,
  ): Promise<ActiveWorkoutCommandResult> {
    const mode = localStorage.getItem("delivery-mode") ?? "retry";
    appendLog("deliveries", { commandId: command.commandId, mode });

    if (mode === "acknowledge") {
      return {
        kind: "acknowledged",
        acknowledgement: {
          commandId: command.commandId,
          workoutId: command.workoutId,
          expectedRevision: command.expectedRevision,
          resultingRevision: command.expectedRevision + 1,
          duplicate: false,
        },
      };
    }

    if (mode === "conflict") {
      return {
        kind: "conflict",
        conflict: {
          commandId: command.commandId,
          workoutId: command.workoutId,
          expectedRevision: command.expectedRevision,
          actualRevision: command.expectedRevision + 2,
          recovery: "refresh_and_replay",
        },
      };
    }

    return {
      kind: "retry",
      code: "persistence",
      message: "Harness delivery failed.",
    };
  }
}

function appendLog(key: string, value: unknown): void {
  const current = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
  current.push(value);
  localStorage.setItem(key, JSON.stringify(current));
}
