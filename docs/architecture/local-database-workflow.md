# Local database workflow

- **Baseline:** Supabase/PostgreSQL implementation workflow
- **Supabase CLI:** `2.116.0`
- **Local PostgreSQL:** `17`

This workflow implements the persistence decisions in [ADR-0018](../decisions/0018-local-supabase-postgres-and-server-data-access.md). It does not define production credentials, authentication, authorization, Row Level Security, or deployment; hosted access is decided in [ADR-0031](../decisions/0031-shared-password-protects-the-hosted-application.md). One command below reaches the hosted database, and it is marked as such.

## Prerequisites

- the Node.js and npm versions from the root [README](../../README.md#local-prerequisites);
- a running Docker-compatible container runtime;
- dependencies installed with `npm ci`.

The Supabase CLI is a locked project dev dependency. Use it through npm scripts or `npm exec`; a separately installed global CLI is not canonical.

## Canonical artifacts

- `supabase/schemas/*.sql` is the structural source of truth.
- `supabase/migrations/*.sql` is the reviewed, ordered deployment history.
- `src/server/database/database.types.ts` is generated from the local `public` schema and committed with every schema change.
- `supabase/tests/database/*.test.sql` contains database-backed pgTAP verification.

Studio and ad hoc SQL editor changes are never canonical. Make structural changes in the declarative schema first.

The initial singleton settings row is migration-owned data because the declarative diff manages structure rather than DML. It starts with `Europe/Zagreb`, matching the accepted local environment, and remains editable as the application's configured IANA time zone. Units remain kilograms and centimeters.

Exercise definitions use deferred constraint triggers to require a complete, type-compatible allowed-mode set at transaction end: the implied base mode must be present, at most one optional addition may accompany it, and a partial unique index makes a second optional addition impossible. The migration that retired the `assisted` base type recreates `exercise_base_type`; because composite foreign keys carry the base type into child tables, it drops both keys, converts every column, restores the keys, and re-grants usage on the recreated type. The `create_exercise_definition` and `update_exercise_definition` functions are the server mutation boundary for the multi-table definition write; both preserve the exercise UUID, split membership, and workout snapshots as applicable. Direct callers must not split definition and mode writes across transactions.

Program and split template writes use database functions for every operation that spans current-program selection, ordering, prescriptions, or the next-split pointer. `set_current_program` moves `app_settings.current_program_id` and the pointer in one transaction, and a deferred trigger requires the current program to point at one of its splits. Split-definition replacement rejects an unknown exercise. Reordering requires the complete identity set and changes only template positions. `delete_split` selects the successor from the pre-deletion order with wrap and rejects the last split of the current program; `delete_program` and `delete_exercise` rely on the cascading and null-setting references that keep History intact. `advance_program_after_proposed_completion` is the narrow compare-and-set rotation transition for a future proposed-split completion transaction: it advances only while the completed split is still the current program's pointer. The later workout-finish transaction owns exact-once invocation and excludes alternate, one-time, incomplete, and historical paths.

Set rows carry one shape check that accepts any partially entered set, including a band mode without a strength. There is no `is_confirmed` field or completeness constraint: whether a set counts is derived by the immutable `workout_set_is_recorded(load_mode, load_kg, band_strength, reps)`, which the current-workout read uses for last-performance eligibility.

Today and workout reads use `get_today_view()` and `get_current_workout()` to return server-only domain aggregates. `start_workout(...)` atomically enforces the singleton resumable session and copies split or one-time exercise snapshots. The extended `apply_active_workout_command(...)` owns all workout-local set/exercise/note/order/timer edits and terminal outcomes; proposed rotation comparison and advancement occur inside the completion transaction. A discarded workout is deleted, while its foreign-key-free command acknowledgement remains only for retry idempotency.

## Start and stop

```sh
npm run db:start
npm run db:stop
```

`db:start` applies committed migrations to the local stack. It is an implementation/runtime command, not part of `npm run check`.

## Change the schema

1. Edit the ordered SQL files under `supabase/schemas/`.
2. Generate but do not automatically apply a migration:

   ```sh
   npm exec supabase db schema declarative sync -- \
     --schema public \
     --name descriptive_change_name \
     --no-apply \
     --strict-coverage
   ```

3. Review the complete generated migration, including permissions and any migration-only DML.
4. Start the updated local stack when implementation requires introspection.
5. Regenerate and review database types:

   ```sh
   npm run db:types
   git diff -- src/server/database/database.types.ts
   ```

6. Keep the declarative schema, migration, generated types, documentation, and relevant tests in the same change.

Supabase CLI `2.116.0` no longer uses `[db.migrations].schema_paths` as the baseline for the legacy `db diff` command. Use `db schema declarative sync`; `schema_paths` still declares the ordered schema tree in `supabase/config.toml`.

## Local baseline seed

`supabase/seed.sql` is a committed baseline that the CLI applies at the end of every `supabase db reset`, enabled through `[db.seed]` in `supabase/config.toml`. Without it a reset leaves an empty database, and the application cannot be used until every exercise, program, and split is entered again by hand.

The seed writes through `create_exercise_definition`, `create_program`, `create_split_definition`, and `set_current_program`, so the deferred definition and current-program constraints are satisfied exactly as an application write satisfies them. It creates ten exercises, one program with three splits, and a current-program pointer. It creates no workout and no history, so Today, History, statistics, and rotation start empty.

Two rules keep the seed compatible with verification. It never reuses a name that a pgTAP suite looks up by name, because those suites resolve fixtures such as the `Push`, `Next`, and `Full` splits with unfiltered name queries that a duplicate would make ambiguous. It also creates no workout row, because the suites assert exact `workout_exercises` and `workout_sets` counts and the schema allows only one resumable workout. Extending the seed keeps both rules.

The seed skips itself when the database already holds exercises or programs, so applying it twice changes nothing.

## Snapshot and restore

The seed restores a usable baseline, not the Owner's own data. These commands carry that data across a verification cycle:

```sh
npm run db:snapshot
npm run db:restore
```

`db:snapshot` writes a data-only dump of the `public` schema to `supabase/snapshots/local-<timestamp>.sql` and copies it to `supabase/snapshots/latest.sql`. That directory is ignored by Git; snapshots are local data and are never committed.

`db:restore` reloads `latest.sql`, or an explicit file passed as the first argument, into the running local database container. It truncates the `public` tables and loads the dump inside one transaction with `session_replication_role = replica`, which suppresses every trigger: the `programs`/`splits` foreign-key cycle then imposes no row order, the deferred definition constraints do not re-run, and `updated_at` keeps its snapshotted value. A failed restore rolls back and leaves the local data unchanged.

When no snapshot exists, `db:restore` reports that and changes nothing, because the seed baseline the reset already applied is the fallback.

The usual cycle around destructive database verification is `npm run db:snapshot`, the reset and tests, then `npm run db:restore`.

## Production data backup

This is the one command here that reaches the hosted database rather than the local one:

```sh
npm run db:backup
```

It writes a data-only dump of the hosted `public` schema to `supabase/snapshots/production-<timestamp>.sql`, in the same ignored directory as the local snapshots and distinguished from them by the `production-` prefix. It requires a linked project (`npx supabase link --project-ref <ref>`) and the hosted database password, which it takes from `SUPABASE_DB_PASSWORD`, then from an ignored `.env.deploy.local`, and otherwise leaves the CLI to prompt for.

The dump carries data only. The schema is reproduced from `supabase/migrations`, so a rebuild is `supabase db push` followed by the dump, never the dump alone.

There is deliberately no `db:restore` counterpart for production. Reloading the local database is safe because that data is disposable; putting a dump back into production is rare and destructive, and stays a deliberate manual step rather than a one-word command.

Take a backup before editing hosted data by hand. The hosted project is on the Supabase free plan, which takes no automated backups and offers no point-in-time recovery, so these dumps are the only copy of the Owner's training history that exists off the server.

## Database verification

The following commands reset local data and run database-backed verification:

```sh
npm exec supabase db reset
npm run test:db
```

The reset applies the exact migration history to a clean local database and then the baseline seed; pgTAP exercises the prepared constraints. Neither command is called by install hooks, lifecycle hooks, or `npm run check`.

Repository integration tests write to the same local database. They create suffixed fixtures, delete them afterwards, and restore the current-program pointer they moved, so a run leaves the seeded or restored data usable.

The database suites cover workout History, exercise and split statistics, weight operations, and body measurements. The weight and body suites work on dates far in the past and on suffixed fixture names, and remove those rows again, because a weigh-in is unique per local date and a measurement type by name. The suite creates and finishes its own workouts, so it shares the precondition below.

`npm run test:repository` runs with `--no-file-parallelism`. Three of its files now start a workout, and they share one local database: `workouts_single_resumable` allows one resumable workout at a time and rotation pointers are shared state, so running the files concurrently makes them fail each other. Serial execution is a correctness requirement of these tests, not a speed preference; a new repository test that writes workouts must keep it.

Browser specs follow the same isolation pattern. Each one that needs a current program reads the seeded pointer first and restores it afterwards, deletes the workouts, program, and exercises it created, and never leaves a resumable workout behind.

Those tests share the pgTAP precondition: two of them start their own workout, and `workouts_single_resumable` allows one active or paused workout per database, so they fail with a duplicate-key error whenever a resumable workout already exists. Run them on a freshly reset database, before restoring a snapshot that contains an active workout. The usual full cycle is `npm run db:snapshot`, the reset, `npm run test:db`, `npm run test:repository`, and only then `npm run db:restore`.
