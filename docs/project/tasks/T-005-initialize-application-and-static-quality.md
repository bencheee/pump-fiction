# T-005 — Initialize application and static-quality baseline

- **Feature:** `F-004`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T12:06:31+02:00`
- **Started:** `2026-08-31T12:06:31+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Verify official stable runtime/package versions, then initialize the accepted application and static-quality baseline without feature behavior.

## Scope

Initialize the single Next.js application, lock the accepted runtime/dependency baseline, create the canonical source directories, and configure all approved static-quality commands without implementing a product feature.

## Out of scope

- Domain database schema or Supabase migrations
- Feature routes, visual screens, application behavior, and feature tests
- Production deployment, authentication, RLS, or access protection

## Acceptance criteria

- [ ] Latest stable security-patched compatible Next.js `16.x`, React `19.x`, Node.js `24.x`, TypeScript, npm lockfile, and accepted foundational packages are recorded and locked.
- [ ] The repository contains one `src/app` Next.js application plus the accepted `src/features`, `src/server`, and `src/shared` boundaries.
- [ ] ESLint, Prettier with Tailwind ordering, strict TypeScript, production build, Markdown lint, internal-link validation, and a static-only `npm run check` are independently runnable.
- [ ] No test command runs through install, lifecycle hooks, or `npm run check`.

## Traceability

- MVP criteria: foundational support for `MVP-REL-001`, `MVP-REL-002`
- ADRs: [ADR-0017](../../decisions/0017-nextjs-app-router-runtime.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../architecture/constraints.md`](../../architecture/constraints.md)

## Dependencies and blockers

- Dependencies: `T-004` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: runtime/dependency records, repository README/setup instructions, this Task, and project projections
- Documentation that should remain unchanged: product behavior and feature UX specifications

## Execution checklist

- [ ] Verify current official stable versions and compatibility before installing dependencies.
- [ ] Initialize the accepted directory and package structure.
- [ ] Configure static-only quality commands and dependency-boundary enforcement.
- [ ] Document local prerequisites and commands.

## Static-check plan and results

- Planned checks: formatting, ESLint, `tsc --noEmit`, production build, Markdown lint, internal-link validation, package-script inspection, `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `no`
- **No-test reason:** This Task initializes tooling and static boundaries without product behavior.
- **Planned tests:** None
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-005: initialize application and static quality`
- **Committed scope:** Not created

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
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and no-test reason are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms transition to `Ready` after `T-004`

## Definition of Done

- [ ] Reviewer recommends approval
- [ ] User approved the exact commit SHA
- [ ] Scope and acceptance criteria are satisfied
- [ ] Canonical documentation and required ADRs are current
- [ ] Approved no-test reason is recorded
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | First implementation Task after accepted design handoff |
| `2026-08-31T12:06:31+02:00` | User / Owner | `Backlog` | `Ready` | Exact `T-004` delivery approved after the prior instruction to begin implementation immediately |
| `2026-08-31T12:06:31+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began runtime verification and application/static-quality initialization |
