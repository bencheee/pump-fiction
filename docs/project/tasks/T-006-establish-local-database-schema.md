# T-006 — Establish local database schema and generated types

- **Feature:** `F-004`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T15:26:48+02:00`
- **Started:** `2026-08-31T14:19:48+02:00`
- **Review started:** `2026-08-31T15:14:02+02:00`
- **Approval requested:** `2026-08-31T15:22:46+02:00`
- **Approved:** `2026-08-31T15:22:46+02:00`
- **Testing started:** `2026-08-31T15:26:48+02:00` for approved replacement delivery `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7`
- **Completed:** `2026-08-31T15:26:48+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-006` is complete and `T-007` owns the next server-boundary scope.

## Scope

Create the declarative local Supabase/PostgreSQL schema, reviewed baseline migration, constraints, seed-independent generated TypeScript database types, and local schema workflow for the accepted MVP domain.

## Out of scope

- Repository/query implementations and UI behavior
- Hosted Supabase, production credentials, authentication, RLS, or deployment
- Derived aggregate tables not accepted by the domain model

## Acceptance criteria

- [x] Declarative SQL models all accepted persistent entities with database-generated UUID identities and required invariants.
- [x] A reviewed versioned migration corresponds to the declarative schema.
- [x] Generated TypeScript database types match the schema and are committed.
- [x] Local schema/setup commands are documented without making live Studio edits canonical.

## Traceability

- MVP criteria: `MVP-REL-001`, `MVP-REL-002`
- ADRs: [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md)

## Dependencies and blockers

- Dependencies: `T-005` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: local database setup/schema workflow, this Task, and project projections
- Documentation that should remain unchanged: visual design and product behavior

## Execution checklist

- [x] Translate the logical model into one declarative SQL schema.
- [x] Generate and review the baseline migration.
- [x] Generate database types and document the repeatable workflow.
- [x] Prepare integration tests without running them before approval.

## Static-check plan and results

- Planned checks: SQL formatting/static inspection, generated-type diff, TypeScript check, documentation links, `git diff --check`
- Results: Passed for the replacement delivery on 2026-08-31 with Node.js `24.20.0`: `npm run check` passed formatting, ESLint, TypeScript, production build, Markdown lint across 76 files, and 533 internal links; `git diff --check` passed. Static inspection confirmed one plan plus 13 assertions and matched each corrected `throws_ok` call to pgTAP's four-argument exception-code/message/description signature. Database tests were not rerun.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After exact-commit approval, apply/reset the local schema and verify constraints and generated-type compatibility against local Supabase.
- **Authorized commit:** `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7`
- **Results:** Passed against exact approved replacement delivery `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7` on 2026-08-31 with Node.js `24.20.0`, Supabase CLI `2.116.0`, and local PostgreSQL `17`: a clean `supabase db reset` applied the baseline migration; `npm run test:db` passed all 13/13 pgTAP assertions; freshly generated normalized public-schema types matched the committed TypeScript file byte-for-byte. The superseded delivery's earlier 2/13 failure remains recorded in transition history.

## Delivery commit

- **Delivery commit SHA:** `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7` (replaces `e9251ed73d0976378f2fe71e68aed3045ee10fdf`)
- **Subject:** `T-006: correct database constraint assertions`
- **Committed scope:** Corrected pgTAP exception assertions and archived-next-split setup; schema, migration, privileges, generated types, and workflow remain unchanged; recorded the failed superseded test run and cleared its approval.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-08-31T15:22:46+02:00`
- **Outcome:** Recommended for approval
- **Findings:** Replaced delivery's approved test run found incorrect pgTAP exception assertion signatures and one misdirected test setup path.

## Approval

- **Approved commit:** `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7`
- **Approved by:** User
- **Approved at:** `2026-08-31T15:22:46+02:00`
- **Approval note:** User explicitly reviewed and approved the exact replacement delivery, authorizing only the recorded `T-006` database verification.

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and unexecuted test plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms transition to `Ready`

## Definition of Done

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Authorized feature tests passed
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Required database foundation after runtime initialization |
| `2026-08-31T14:19:48+02:00` | User / Owner | `Backlog` | `Ready` | Approved exact `T-005` delivery after the prior instruction to continue directly into implementation |
| `2026-08-31T14:19:48+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began accepted-domain review and declarative schema implementation |
| `2026-08-31T14:56:59+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery commit `e9251ed73d0976378f2fe71e68aed3045ee10fdf`; all planned static checks passed and database tests were not run |
| `2026-08-31T15:01:41+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery commit with no findings and recommended approval |
| `2026-08-31T15:01:41+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved exact commit `e9251ed73d0976378f2fe71e68aed3045ee10fdf` and authorized only the recorded database tests |
| `2026-08-31T15:09:44+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Ran the recorded database verification against exact delivery `e9251ed73d0976378f2fe71e68aed3045ee10fdf` |
| `2026-08-31T15:09:44+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Clean reset and generated types passed, but 11/13 pgTAP assertions failed because their exception expectations were expressed incorrectly; replacement test source requires a new delivery SHA and approval |
| `2026-08-31T15:14:02+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created replacement delivery commit `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7`; static checks passed and corrected database tests were not run |
| `2026-08-31T15:22:46+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed replacement delivery `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7` with no additional findings and recommended approval |
| `2026-08-31T15:22:46+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved the exact replacement commit and authorized only the recorded database verification |
| `2026-08-31T15:26:48+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the recorded database verification in an isolated worktree at exact replacement delivery `a5cf25925aabcdebd74cd0c4b0fbe286010eaff7` |
| `2026-08-31T15:26:48+02:00` | Codex primary agent / Tester | `Testing` | `Done` | Clean reset passed, all 13 pgTAP assertions passed, and regenerated database types matched byte-for-byte |
