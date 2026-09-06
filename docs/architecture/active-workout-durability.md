# Active-workout durability foundation

- **Status:** Implemented foundation

This document records the concrete `T-008` command transport foundation and the `T-014` Today/workout application and persistence operations under [ADR-0019](../decisions/0019-application-boundaries-and-active-workout-durability.md). It does not claim completed workout screens or general offline support.

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
    | "resume_timer"
    | "update_set"
    | "add_set"
    | "remove_set"
    | "add_exercise"
    | "remove_exercise"
    | "reorder_exercises"
    | "finish_workout";
  payload: OperationSpecificPayload;
  clientCreatedAt: string; // timestamp retained unchanged through retries
};
```

`update_set` replaces the complete current set payload, so mode changes cannot retain inapplicable hidden values. It carries no confirmation field: whether a set counts is derived from its values, not sent by the client. Adding and removing sets, adding/removing/reordering workout exercises, notes, and timer transitions are discrete commands. Populated set/exercise removal carries explicit confirmation evidence. `finish_workout` owns completed, incomplete, and discard outcomes; it also performs any eligible proposed-split rotation transition in the same transaction. The UI Tasks consume this union and must not create a parallel mutation path.

The thin Route Handler parses JSON, calls the server composition boundary, and maps the application result to HTTP:

| Result | HTTP | Client action |
| --- | --- | --- |
| `acknowledged` | `200` | Verify command/workout/revisions, then remove that command from the outbox |
| `conflict` | `409` | Keep pending commands, refresh the authoritative workout, and replay them for recovery |
| `rejected` | `400` or `404` | Terminal for that command: drop it from the outbox, report the change it lost, and recover the rest |
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

Discard deletes the canonical workout and its owned occurrences/sets while retaining the command acknowledgement as idempotency evidence. The command record therefore keeps the workout UUID without a foreign key; it is not a surviving workout or History record.

## Today, start, and restore operations

`get_today_view()` derives the configured local date, active program proposal, alternate active splits, eligible completed-workout duration averages, and the optional current-workout summary. `start_workout(...)` takes a transaction-scoped singleton lock, revalidates the active program/split or active one-time exercises, derives `workout_date` in the configured IANA time zone, and creates the workout-owned snapshot atomically.

Split starts copy program/split identity and names, ordered exercise identity/definition/note/modes, prescription, and exactly the planned number of empty set rows. One-time starts copy the ordered active exercise definitions and create one empty workout-local starter set per selected exercise without inventing a split prescription. Starting never advances rotation.

`get_current_workout()` returns the authoritative resumable aggregate, including revision, timer persistence, ordered exercises/sets, snapshots, workout notes, and the latest eligible completed performance for each persistent exercise identity. Incomplete workouts are excluded from Last time.

## IndexedDB outbox and delivery

`IndexedDbActiveWorkoutOutbox` owns one narrow IndexedDB database and one auto-incremented pending-command store. `enqueue()` resolves only after its read-write transaction commits. The generated sequence is the FIFO order; client timestamps are metadata rather than queue ordering.

`ActiveWorkoutDeliveryController` serializes delivery:

- it sends only the oldest pending command;
- an acknowledgement must match command ID, workout ID, expected revision, and resulting revision before removal;
- retry, malformed acknowledgement, and conflict retain the command and stop the queue; a rejection stops the queue too, but leaves the outbox first, so it is delivered at most once and never blocks what follows;
- status is explicitly `saving`, `saved`, or `save_failed` with pending count;
- conflict status carries `refresh_and_replay`, the authoritative revision conflict, and the retained FIFO command list;
- rejection status carries `discard_and_replay`, the command that was dropped, and the commands still pending behind it.

On reload or reopen, `restoreActiveWorkout()` first calls the supplied authoritative server loader, then reads pending commands for that workout and replays them through the supplied pure feature reducer. The workout UI owns the authoritative state shape and reducer; IndexedDB never becomes an application cache or canonical workout store.

## Workout-screen consumption

`T-016` supplies that reducer as `applyCommandToWorkout`, a pure local mirror of the persistence function that also assigns each optimistic structural addition (`add_set`, `add_exercise`) the command ID as a synthetic placeholder identity. Placeholder rows stay non-interactive until the queue drains, after which the screen refreshes the authoritative aggregate through the read operation and replaces synthetic identities with server-created rows.

Conflict recovery follows the recorded `refresh_and_replay` contract: the screen fetches the authoritative workout, then re-enqueues the retained FIFO commands as fresh envelopes with new command IDs rebased onto the refreshed revision before flushing again. Original command IDs are never reused with a different expected revision because they are consumed idempotency evidence. A refreshed aggregate that no longer contains the workout returns the user to Today. Rejection recovery, accepted by the Owner on `2026-09-05` after a permanently refused command stranded a workout under `T-025`, reuses that same path. The refused command is terminal: it leaves the outbox before the status is reported, so it is never retried and never blocks the commands behind it. The screen then runs the refresh-and-replay recovery without waiting for a gesture, because a workout must not sit stranded behind a change it cannot save, and it states plainly that one change could not be saved and was undone, naming the affected set or exercise. The remaining commands are rebased onto the refreshed revision exactly as after a conflict. Nothing offers Retry for a refused command, since retrying it would only fail the same way.

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

The repository integration scenario covers transactional apply, duplicate delivery, stale revision conflict, and timer transitions. Playwright runs the persisted IndexedDB reload/retry/FIFO/conflict scenarios in phone-sized Chromium and WebKit. The test-support route is hidden unless the server is started with `PF_ENABLE_TEST_SUPPORT=1`, which [ADR-0029](../decisions/0029-one-visibility-rule-for-test-support-routes.md) makes the single rule for both harnesses, so `npm run test:browser` sets that flag on its one production server on `3100` and runs every spec, this one included, against the build the phone user gets.
