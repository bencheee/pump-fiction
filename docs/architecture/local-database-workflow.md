# Local database workflow

- **Baseline:** Supabase/PostgreSQL implementation workflow
- **Supabase CLI:** `2.116.0`
- **Local PostgreSQL:** `17`

This workflow implements the persistence decisions in [ADR-0018](../decisions/0018-local-supabase-postgres-and-server-data-access.md). It does not define production credentials, authentication, authorization, Row Level Security, or deployment.

## Prerequisites

- the Node.js and npm versions from the root [README](../../README.md#local-prerequisites);
- a running Docker-compatible container runtime;
- dependencies installed with `npm ci`.

The Supabase CLI is a locked project dev dependency. Use it through npm scripts or `npm exec`; a separately installed global CLI is not canonical.

## Canonical artifacts

- `supabase/schemas/*.sql` is the structural source of truth.
- `supabase/migrations/*.sql` is the reviewed, ordered deployment history.
- `src/server/database/database.types.ts` is generated from the local `public` schema and committed with every schema change.
- `supabase/tests/database/*.test.sql` contains database-backed pgTAP verification that may run only after the exact delivery commit is approved.

Studio and ad hoc SQL editor changes are never canonical. Make structural changes in the declarative schema first.

The initial singleton settings row is migration-owned data because the declarative diff manages structure rather than DML. It starts with `Europe/Zagreb`, matching the accepted local environment, and remains editable as the application's configured IANA time zone. Units remain kilograms and centimeters.

Exercise definitions use deferred constraint triggers to require a complete, type-compatible allowed-mode set at transaction end: the implied base mode must be present, an assisted definition must hold exactly one assistance mode, and a partial unique index makes a second optional addition impossible. The `create_exercise_definition` and `update_exercise_definition` functions are the server mutation boundary for the multi-table definition write; both preserve the exercise UUID, split membership, and workout snapshots as applicable. Direct callers must not split definition and mode writes across transactions.

Program and split template writes use database functions for every operation that spans current-program selection, ordering, prescriptions, or the next-split pointer. `set_current_program` moves `app_settings.current_program_id` and the pointer in one transaction, and a deferred trigger requires the current program to point at one of its splits. Split-definition replacement rejects an unknown exercise. Reordering requires the complete identity set and changes only template positions. `delete_split` selects the successor from the pre-deletion order with wrap and rejects the last split of the current program; `delete_program` and `delete_exercise` rely on the cascading and null-setting references that keep History intact. `advance_program_after_proposed_completion` is the narrow compare-and-set rotation transition for a future proposed-split completion transaction: it advances only while the completed split is still the current program's pointer. The later workout-finish transaction owns exact-once invocation and excludes alternate, one-time, incomplete, and historical paths.

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

6. Commit the declarative schema, migration, generated types, documentation, and prepared tests in the same Task.

Supabase CLI `2.116.0` no longer uses `[db.migrations].schema_paths` as the baseline for the legacy `db diff` command. Use `db schema declarative sync`; `schema_paths` still declares the ordered schema tree in `supabase/config.toml`.

## Verification gate

The following are database-backed feature verification and must not run before the user approves the exact Task delivery commit:

```sh
npm exec supabase db reset
npm run test:db
```

After approval, reset applies the exact migration history to a clean local database, pgTAP exercises the prepared constraints, and regenerated types are compared with the committed file. Neither command is called by install hooks, lifecycle hooks, or `npm run check`.
