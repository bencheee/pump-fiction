"use client";

import type { ActiveWorkoutCommand } from "../domain/active-workout-command";

export type PendingActiveWorkoutCommand = Readonly<{
  sequence: number;
  command: ActiveWorkoutCommand;
}>;

export interface ActiveWorkoutOutbox {
  enqueue(command: ActiveWorkoutCommand): Promise<void>;
  list(workoutId?: string): Promise<readonly PendingActiveWorkoutCommand[]>;
  remove(commandId: string): Promise<void>;
}

type StoredCommand = Readonly<{
  sequence?: number;
  commandId: string;
  workoutId: string;
  command: ActiveWorkoutCommand;
}>;

const databaseName = "pump-fiction-active-workout";
const databaseVersion = 1;
const storeName = "pending_commands";
const commandIdIndex = "command_id";

export class IndexedDbActiveWorkoutOutbox implements ActiveWorkoutOutbox {
  private databasePromise?: Promise<IDBDatabase>;

  async enqueue(command: ActiveWorkoutCommand): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.add({
      commandId: command.commandId,
      workoutId: command.workoutId,
      command,
    } satisfies StoredCommand);

    await transactionComplete(transaction);
  }

  async list(
    workoutId?: string,
  ): Promise<readonly PendingActiveWorkoutCommand[]> {
    const database = await this.open();
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    const records = await requestResult<StoredCommand[]>(request);
    await transactionComplete(transaction);

    return records
      .filter(
        (record): record is StoredCommand & { sequence: number } =>
          typeof record.sequence === "number" &&
          (workoutId === undefined || record.workoutId === workoutId),
      )
      .sort((left, right) => left.sequence - right.sequence)
      .map((record) => ({
        sequence: record.sequence,
        command: record.command,
      }));
  }

  async remove(commandId: string): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const key = await requestResult<IDBValidKey | undefined>(
      store.index(commandIdIndex).getKey(commandId),
    );

    if (key !== undefined) {
      store.delete(key);
    }

    await transactionComplete(transaction);
  }

  close(): void {
    void this.databasePromise?.then((database) => database.close());
    this.databasePromise = undefined;
  }

  private open(): Promise<IDBDatabase> {
    this.databasePromise ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, databaseVersion);

      request.onupgradeneeded = () => {
        const database = request.result;
        const store = database.createObjectStore(storeName, {
          keyPath: "sequence",
          autoIncrement: true,
        });
        store.createIndex(commandIdIndex, "commandId", { unique: true });
        store.createIndex("workout_id", "workoutId");
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error ?? new Error("IndexedDB open failed"));
      request.onblocked = () =>
        reject(new Error("IndexedDB upgrade was blocked"));
    });

    return this.databasePromise;
  }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
  });
}
