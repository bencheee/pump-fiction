# T-027 — Restore usable local data after a verification reset

- **Feature:** `F-013`
- **Status:** `In Review`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:17:58+02:00`
- **Updated:** `2026-09-05T19:51:11+02:00`
- **Started:** `2026-09-05T19:42:31+02:00`
- **Review started:** `2026-09-05T19:51:11+02:00`
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Reviewer checks `9b8247f73bf9347cdd44f23e5172c16b9b99cfae` against the scope and acceptance criteria; the reset, pgTAP, and snapshot round trip stay unauthorized until the Owner approves that exact SHA.

## Scope

Stop the approval-gated database verification from costing the Owner their local data.

Approach confirmed by the Owner on `2026-09-05`, choosing both mechanisms with the seed as the fallback:

- a committed `supabase/seed.sql` that the CLI applies on every reset, giving a small baseline of exercises, one program with its splits, and no workout history, so the application is immediately usable;
- an `npm run db:snapshot` and `npm run db:restore` pair that dumps and reloads the Owner's own `public` data around a verification, with the dump ignored by git;
- the seed as the fallback whenever no snapshot exists.

Delivery added one narrow item the recorded approach implies: the two repository integration tests moved `app_settings.current_program_id` and left it null, which emptied Today after every authorized verification even when the seed or a snapshot had supplied a program. They now put the pointer back.

The verification gate itself does not change: a clean reset stays required before pgTAP, and testing still needs the Owner's approval of the exact commit.

## Out of scope

- Any schema, migration, product, or screen change
- Production or hosted data handling
- Weakening the approval-gated verification rule

## Acceptance criteria

- [ ] After a clean reset the application opens with a usable program, splits, and exercises without manual re-entry.
- [ ] The seed contains no workout history, so statistics and rotation start empty and pgTAP stays unaffected.
- [ ] A snapshot taken before a verification restores the Owner's own data afterwards, including workouts.
- [ ] Snapshot files are ignored by git and never committed.
- [ ] `npm run check` and the pgTAP suites behave exactly as before.

## Traceability

- MVP criteria: none; this Task changes the development workflow
- ADRs: [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md)
- Canonical documents: [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md), [`../../../README.md`](../../../README.md)

## Dependencies and blockers

- Dependencies: None
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: the local database workflow with the seed and snapshot commands, the README prerequisites if commands change, this Task, `F-013`, registry, dashboard, and project state
- Updated in delivery: [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md) gained a baseline-seed section, a snapshot-and-restore section, and a note that the verification gate now ends on the seed and that repository tests restore the current-program pointer; [`../../../README.md`](../../../README.md) lists the two new commands; this Task carries the delivery record
- Documentation that should remain unchanged: the verification gate, migration workflow, and schema guidance

## Execution checklist

- [x] Add the baseline seed and confirm the CLI applies it on reset — `supabase/seed.sql` with `[db.seed] enabled = true` in `supabase/config.toml`; the CLI applying it is verified only by the authorized reset.
- [x] Add the snapshot and restore scripts and ignore their output — `scripts/db-snapshot.mjs`, `scripts/db-restore.mjs`, and `scripts/local-database.mjs` behind `npm run db:snapshot` and `npm run db:restore`, with `supabase/snapshots/` ignored.
- [x] Document both in the database workflow — new seed and snapshot sections plus the README command list.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, declarative-schema convergence, documentation links, and `git diff --check`
- Results: `npm run check` passed, covering formatting, ESLint, strict TypeScript, the production build, the UI asset manifest, Markdown lint, and 816 internal links; `supabase db lint --local` reported no schema errors; `git diff --check` reported no whitespace errors. Declarative-schema convergence does not apply because this Task changes no schema, migration, or generated type. The seed was parsed once inside a rolled-back transaction, which compiled the whole block and left the local data untouched; its guard skipped the body, so no seed statement was executed and the baseline itself is unverified until the authorized reset.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** a clean reset that lands on the seeded baseline, an unchanged pgTAP run against it, and a snapshot/restore round trip that returns a workout; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `9b8247f73bf9347cdd44f23e5172c16b9b99cfae`
- **Subject:** `T-027: restore usable local data after a verification reset`
- **Committed scope:** `supabase/seed.sql`, `supabase/config.toml`, `scripts/db-snapshot.mjs`, `scripts/db-restore.mjs`, `scripts/local-database.mjs`, `package.json`, `.gitignore`, the two repository integration tests, `docs/architecture/local-database-workflow.md`, `README.md`, and this Task

## Review

- **Reviewer:** User
- **Reviewed at:** Not reviewed
- **Outcome:** Not reviewed
- **Findings:** None recorded

## Approval

- **Approved commit:** Not approved
- **Approved by:** Not approved
- **Approved at:** Not approved
- **Approval note:** Not approved

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner chooses the approach and confirms the transition to `Ready`

## Definition of Done

- [ ] Reviewer recommends approval
- [ ] User approved the exact commit SHA
- [ ] Scope and acceptance criteria are satisfied
- [ ] Canonical documentation and required ADRs are current
- [ ] Authorized feature tests passed
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-05T19:17:58+02:00` | User / Owner | None | `Backlog` | Requested after the 2026-09-05 verification reset destroyed the local programs, exercises, and workout |
| `2026-09-05T19:42:31+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed both mechanisms with the seed as the fallback, completing the Definition of Ready |
| `2026-09-05T19:42:31+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the seed and the snapshot/restore pair |
| `2026-09-05T19:51:11+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `9b8247f73bf9347cdd44f23e5172c16b9b99cfae`; static checks passed and no feature test ran |
