# F-013 — Local Verification Data

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-05T19:17:58+02:00`
- **Updated:** `2026-09-05T19:51:11+02:00`
- **Progress:** `0/1 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

Verifying the database stops costing the Owner their own data. After the approval-gated clean reset, the local application is usable again without re-entering programs, splits, and exercises by hand.

## Scope

- Included: how the local database is repopulated after a reset, and how the Owner's own data can survive a verification cycle.
- Excluded: the approval-gated verification rule itself, production data handling, and any change to schema, migrations, or product behavior.

## Context

pgTAP requires a clean database, because its fixtures create their own active workout and the schema allows only one. The documented gate therefore runs `supabase db reset`, which deletes every local row. On `2026-09-05` that cost the Owner a live workout plus their program, splits, and exercises, and it will repeat during every future database verification, including all of `F-008`.

## Acceptance criteria

- Product criteria: none; this Feature changes the development workflow, not application behavior
- Feature-specific criteria: after an authorized reset the Owner reaches a usable application without manual re-entry, and their own data can be preserved across a verification cycle when they choose

## Tasks

- `T-027` — Restore usable local data after a verification reset

## Dependencies and blockers

- Dependencies: None
- Blockers: None

## Related decisions and documents

- ADRs: [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md)
- Canonical documents: [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md), [`../../process/development-governance.md`](../../process/development-governance.md)

## Confirmed approach

The Owner chose all three parts on `2026-09-05`, closing the open choices:

- a committed seed that gives every reset the same baseline program, splits, and exercises;
- a snapshot and restore pair that saves the Owner's current data before a verification and puts it back afterwards;
- both, with the seed as the fallback when no snapshot exists.

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] The approach among the open choices is decided
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms readiness and the recorded approach

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-05T19:17:58+02:00` | User / Owner | Created `F-013` in `Next / 2` | Asked for verification to stop destroying local data after the 2026-09-05 reset |
| `2026-09-05T19:28:05+02:00` | User / Owner | Confirmed readiness and moved `F-013` to `Next / 1` | Chose to protect local data before the next model corrections |
| `2026-09-05T19:42:31+02:00` | User / Owner | Confirmed the approach and started `F-013` | Chose the seed and the snapshot/restore pair together, with the seed as the fallback |
| `2026-09-05T19:51:11+02:00` | Claude Code primary agent / Executor | `T-027` delivered `9b8247f73bf9347cdd44f23e5172c16b9b99cfae` and entered review | The seed, the snapshot/restore pair, and their documentation are ready for the Owner's review |
