# T-005 — Initialize application and static-quality baseline

- **Feature:** `F-004`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T14:19:48+02:00`
- **Started:** `2026-08-31T12:06:31+02:00`
- **Review started:** `2026-08-31T12:26:36+02:00`
- **Approval requested:** `2026-08-31T14:19:48+02:00`
- **Approved:** `2026-08-31T14:19:48+02:00`
- **Testing started:** Not reached
- **Completed:** `2026-08-31T14:19:48+02:00`
- **Canceled:** Not reached
- **Next action:** None; Task is complete and `T-006` is the active implementation Task.

## Scope

Initialize the single Next.js application, lock the accepted runtime/dependency baseline, create the canonical source directories, and configure all approved static-quality commands without implementing a product feature.

## Out of scope

- Domain database schema or Supabase migrations
- Feature routes, visual screens, application behavior, and feature tests
- Production deployment, authentication, RLS, or access protection

## Acceptance criteria

- [x] Latest stable security-patched compatible Next.js `16.x`, React `19.x`, Node.js `24.x`, TypeScript, npm lockfile, and accepted foundational packages are recorded and locked.
- [x] The repository contains one `src/app` Next.js application plus the accepted `src/features`, `src/server`, and `src/shared` boundaries.
- [x] ESLint, Prettier with Tailwind ordering, strict TypeScript, production build, Markdown lint, internal-link validation, and a static-only `npm run check` are independently runnable.
- [x] No test command runs through install, lifecycle hooks, or `npm run check`.

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

- [x] Verify current official stable versions and compatibility before installing dependencies.
- [x] Initialize the accepted directory and package structure.
- [x] Configure static-only quality commands and dependency-boundary enforcement.
- [x] Document local prerequisites and commands.

## Static-check plan and results

- Planned checks: formatting, ESLint, `tsc --noEmit`, production build, Markdown lint, internal-link validation, package-script inspection, `git diff --check`
- Results: Passed on 2026-08-31 with Node.js `24.20.0` and npm `11.19.0`: checksum-verified official Node binary; `npm ci --ignore-scripts` with 0 vulnerabilities; `npm run check` completed Prettier, ESLint, `tsc --noEmit`, Next.js `16.3.3` production build, Markdown lint across 75 files, and Lychee offline validation of 527 links with 0 errors. `npm pkg get scripts` confirmed no test or lifecycle script.

## Locked initialization baseline

- Runtime: Node.js `24.20.0`, npm `11.19.0`, Next.js `16.3.3`, React and React DOM `19.2.8`, TypeScript `5.9.3`
- Accepted foundational runtime packages: `@supabase/supabase-js` `2.112.4`, `radix-ui` `1.6.7`, Recharts `3.10.1`, React Is `19.2.8`, `server-only` `0.0.1`
- Styling and static tools: Tailwind CSS and PostCSS adapter `4.3.3`, ESLint `9.39.5`, `eslint-config-next` `16.3.3`, Prettier `3.9.6`, Tailwind Prettier plugin `0.8.1`, `markdownlint-cli2` `0.23.2`, Lychee `0.24.2`
- Compatibility note: ESLint `9.39.5` is the newest release accepted by the peer ranges of the plugins bundled with the selected Next.js config; no unsupported ESLint `10` override is used.

## Test plan and results

- **Test required:** `no`
- **No-test reason:** This Task initializes tooling and static boundaries without product behavior.
- **Planned tests:** None
- **Authorized commit:** `f8781b22a3e9abd7bf31afef9a74d9a0f55d429e`; no tests required
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `f8781b22a3e9abd7bf31afef9a74d9a0f55d429e`
- **Subject:** `T-005: initialize application and static quality`
- **Committed scope:** Locked runtime and dependency graph; minimal App Router root and canonical source boundaries; Tailwind/PostCSS, ESLint architecture rules, Prettier, strict TypeScript, production build, Markdown lint, and Lychee configuration; local setup documentation and synchronized architecture/project state.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-08-31T14:19:48+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** `f8781b22a3e9abd7bf31afef9a74d9a0f55d429e`
- **Approved by:** User / Approver
- **Approved at:** `2026-08-31T14:19:48+02:00`
- **Approval note:** User explicitly reviewed and approved commit `f8781b22a3e9abd7bf31afef9a74d9a0f55d429e`.

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

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Approved no-test reason is recorded
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | First implementation Task after accepted design handoff |
| `2026-08-31T12:06:31+02:00` | User / Owner | `Backlog` | `Ready` | Exact `T-004` delivery approved after the prior instruction to begin implementation immediately |
| `2026-08-31T12:06:31+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began runtime verification and application/static-quality initialization |
| `2026-08-31T12:26:36+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery commit `f8781b22a3e9abd7bf31afef9a74d9a0f55d429e`; all planned static checks passed and no feature tests were run |
| `2026-08-31T14:19:48+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery and recommended it for approval with no findings |
| `2026-08-31T14:19:48+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved commit `f8781b22a3e9abd7bf31afef9a74d9a0f55d429e` |
| `2026-08-31T14:19:48+02:00` | Codex primary agent / Executor | `Approved` | `Done` | Recorded the accepted no-test reason and completed the initialization Task |
