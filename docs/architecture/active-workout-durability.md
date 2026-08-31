# Active-workout durability foundation

- **Status:** Implemented foundation

This document records the concrete `T-008` command transport, PostgreSQL transaction, pending-outbox, delivery, and recovery contracts under [ADR-0019](../decisions/0019-application-boundaries-and-active-workout-durability.md). It does not claim complete workout feature behavior or general offline support.

## Command envelope and endpoint

Every implemented active-workout mutation crosses the dedicated `POST /api/active-workout/commands` Route Handler as a validated discriminated command:

```ts
type ActiveWorkoutCommand = {
  commandId: string; // UUID generated once and retained through retries
  workoutId: string;
  expectedRevision: number;
  operation:
    | "set_workout_exercise_note"
    | "pause_timer"
    | "resume_timer";
  payload: OperationSpecificPayload;
  clientCreatedAt: string; // timestamp retained unchanged through retries
};
```

`set_workout_exercise_note` proves the workout-local autosave path without completing workout screens. `pause_timer` and `resume_timer` persist transitions and timestamps rather than display ticks. Later feature Tasks must extend this discriminated union and the same database function when they add agreed set, exercise, ordering, finish, or discard operations; they must not create a parallel mutation path.

The thin Route Handler parses JSON, calls the server composition boundary, and maps the application result to HTTP:

| Result | HTTP | Client action |
| --- | --- | --- |
| `acknowledged` | `200` | Verify command/workout/revisions, then remove that command from the outbox |
| `conflict` | `409` | Keep pending commands, refresh the authoritative workout, and replay them for recovery |
| `rejected` | `400` or `404` | Keep the command and expose a failed save for explicit resolution |
| `retry` | `503` | Keep the command and retry delivery later |

Raw PostgreSQL, PostgREST, and environment details never cross this transport boundary.

## Transaction and idempotency

`public.apply_active_workout_command(...)` is the sole persistence call for the implemented commands. One PostgreSQL transaction:

1. takes a transaction-scoped advisory lock derived from `command_id`, then checks whether that ID already has a matching durable record;
2. returns its original acknowledgement for a matching retry, without applying the effect again;
3. rejects reuse of that ID for a different envelope;
4. locks the target workout row;
5. returns a conflict without writes when the expected revision is stale or the workout is no longer resumable;
6. applies the typed mutation, increments the workout revision, and inserts its `active_workout_commands` record atomically.

The command record stores only server-applied idempotency evidence. It is not a queue. Browser-pending commands remain a separate transport concern.

## IndexedDB outbox and delivery

`IndexedDbActiveWorkoutOutbox` owns one narrow IndexedDB database and one auto-incremented pending-command store. `enqueue()` resolves only after its read-write transaction commits. The generated sequence is the FIFO order; client timestamps are metadata rather than queue ordering.

`ActiveWorkoutDeliveryController` serializes delivery:

- it sends only the oldest pending command;
- an acknowledgement must match command ID, workout ID, expected revision, and resulting revision before removal;
- retry, rejection, malformed acknowledgement, and conflict retain the command and stop the queue;
- status is explicitly `saving`, `saved`, or `save_failed` with pending count;
- conflict status carries `refresh_and_replay`, the authoritative revision conflict, and the retained FIFO command list.

On reload or reopen, `restoreActiveWorkout()` first calls the supplied authoritative server loader, then reads pending commands for that workout and replays them through the supplied pure feature reducer. The later workout UI owns the authoritative state shape and reducer; IndexedDB never becomes an application cache or canonical workout store.

## Approval-gated verification

Prepared tests remain separate from static checks and must not run before the exact delivery commit is approved:

```sh
npm run test:unit
npm run db:start
# Export SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from `supabase status -o env`.
npm run test:repository
npm exec playwright install chromium webkit
npm run test:browser
```

The repository integration scenario covers transactional apply, duplicate delivery, stale revision conflict, and timer transitions. Playwright runs the persisted IndexedDB reload/retry/FIFO/conflict scenarios in phone-sized Chromium and WebKit. The production build resolves the test-support route through the not-found boundary; it is available only to the development server used by the approved browser tests.
