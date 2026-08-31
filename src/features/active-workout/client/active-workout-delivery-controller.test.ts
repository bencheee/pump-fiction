import { describe, expect, it, vi } from "vitest";

import type { ActiveWorkoutCommand } from "../domain/active-workout-command";
import type { ActiveWorkoutCommandTransport } from "./active-workout-command-transport";
import { ActiveWorkoutDeliveryController } from "./active-workout-delivery-controller";
import type {
  ActiveWorkoutOutbox,
  PendingActiveWorkoutCommand,
} from "./active-workout-outbox";
import { restoreActiveWorkout } from "./restore-active-workout";

const firstCommand = createCommand(
  "20000000-0000-4000-8000-000000000001",
  0,
  "First",
);
const secondCommand = createCommand(
  "20000000-0000-4000-8000-000000000002",
  1,
  "Second",
);

describe("ActiveWorkoutDeliveryController", () => {
  it("persists before delivery and removes only an acknowledged command", async () => {
    const events: string[] = [];
    const outbox = new MemoryOutbox(events);
    const transport = createTransport(async (command) => {
      events.push(`deliver:${command.commandId}`);
      return acknowledgement(command);
    });
    const controller = new ActiveWorkoutDeliveryController(outbox, transport);

    await controller.enqueue(firstCommand);
    await controller.flush();

    expect(events).toEqual([
      `persist:${firstCommand.commandId}`,
      `deliver:${firstCommand.commandId}`,
      `remove:${firstCommand.commandId}`,
    ]);
    expect(await outbox.list()).toEqual([]);
    expect(controller.getStatus()).toEqual({ state: "saved", pendingCount: 0 });
  });

  it("stops FIFO delivery on conflict and retains all pending commands", async () => {
    const outbox = new MemoryOutbox();
    await outbox.enqueue(firstCommand);
    await outbox.enqueue(secondCommand);
    const transport = createTransport(async (command) => ({
      kind: "conflict",
      conflict: {
        commandId: command.commandId,
        workoutId: command.workoutId,
        expectedRevision: command.expectedRevision,
        actualRevision: 9,
        recovery: "refresh_and_replay",
      },
    }));
    const controller = new ActiveWorkoutDeliveryController(outbox, transport);

    const result = await controller.flush();

    expect(result.kind).toBe("stopped");
    expect(transport.deliver).toHaveBeenCalledTimes(1);
    expect(
      (await outbox.list()).map(({ command }) => command.commandId),
    ).toEqual([firstCommand.commandId, secondCommand.commandId]);
    expect(controller.getStatus()).toMatchObject({
      state: "save_failed",
      pendingCount: 2,
      recovery: { kind: "refresh_and_replay" },
    });
  });

  it("restores authoritative state before replaying pending commands", async () => {
    const events: string[] = [];
    const outbox = new MemoryOutbox(events);
    await outbox.enqueue(firstCommand);
    await outbox.enqueue(secondCommand);

    const result = await restoreActiveWorkout(
      firstCommand.workoutId,
      outbox,
      async () => {
        events.push("load-authoritative");
        return { notes: [] as string[] };
      },
      (state, command) =>
        command.operation === "set_workout_exercise_note"
          ? { notes: [...state.notes, command.payload.note] }
          : state,
    );

    expect(events.slice(-2)).toEqual(["load-authoritative", "list"]);
    expect(result.authoritative.notes).toEqual([]);
    expect(result.optimistic.notes).toEqual(["First", "Second"]);
  });
});

class MemoryOutbox implements ActiveWorkoutOutbox {
  private records: PendingActiveWorkoutCommand[] = [];

  constructor(private readonly events: string[] = []) {}

  async enqueue(command: ActiveWorkoutCommand): Promise<void> {
    this.events.push(`persist:${command.commandId}`);
    this.records.push({ sequence: this.records.length + 1, command });
  }

  async list(
    workoutId?: string,
  ): Promise<readonly PendingActiveWorkoutCommand[]> {
    this.events.push("list");
    return this.records.filter(
      ({ command }) =>
        workoutId === undefined || command.workoutId === workoutId,
    );
  }

  async remove(commandId: string): Promise<void> {
    this.events.push(`remove:${commandId}`);
    this.records = this.records.filter(
      ({ command }) => command.commandId !== commandId,
    );
  }
}

function createTransport(
  deliver: ActiveWorkoutCommandTransport["deliver"],
): ActiveWorkoutCommandTransport {
  return { deliver: vi.fn(deliver) };
}

function acknowledgement(command: ActiveWorkoutCommand) {
  return {
    kind: "acknowledged" as const,
    acknowledgement: {
      commandId: command.commandId,
      workoutId: command.workoutId,
      expectedRevision: command.expectedRevision,
      resultingRevision: command.expectedRevision + 1,
      duplicate: false,
    },
  };
}

function createCommand(
  commandId: string,
  expectedRevision: number,
  note: string,
): ActiveWorkoutCommand {
  return {
    commandId,
    workoutId: "20000000-0000-4000-8000-000000000010",
    expectedRevision,
    operation: "set_workout_exercise_note",
    payload: {
      workoutExerciseId: "20000000-0000-4000-8000-000000000011",
      note,
    },
    clientCreatedAt: `2026-08-31T14:00:0${expectedRevision}.000Z`,
  };
}
