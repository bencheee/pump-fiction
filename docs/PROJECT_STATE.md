# Project state

## Current phase

The functional specification, textual mobile-wireframe decisions, local-MVP acceptance criteria, development governance, repository-native project-management system, local technical architecture, MVP Feature breakdown, and external UI/UX collaboration process are accepted. `F-004` Application and Data Foundation, `F-005` Exercise Library, `F-006` Programs and Splits, and `F-007` Today and Active Workout are complete, the last with the Owner's confirmed feature result covering Today, workout start, the active workout, and the finish review.

## Conceptually completed

- Product boundary and four-destination mobile information architecture
- Exercise types, load modes, band semantics, notes, and archiving
- Programs, splits, ordering, activation, and normal rotation rules
- Active-workout snapshot, set entry, timer, persistence, and finish lifecycle
- Workout, exercise, and split History behavior, PR rules, and derived statistics
- Weight and user-defined body-measurement behavior
- Logical domain entities and template/snapshot separation
- Local-first delivery direction and future Vercel/Supabase target
- Testable local-MVP acceptance criteria with stable IDs (locked)
- Documentation-as-system-of-record and approval-gated feature-testing rules
- Complete repository-native project-management workflow, templates, dashboard, and registry
- Ordered Local MVP Feature breakdown, external-design workflow, and context-efficient documentation rules
- Frozen external mobile design source, tokens, specifications, assets, and structural reference scope

The [`INDEX.md`](INDEX.md) routes to each canonical specification.

## Accepted and locked decisions

- Private, single-user, phone-only product with no local-phase accounts or login: [ADR-0001](decisions/0001-private-mobile-only-app.md)
- Workout snapshots are separate from mutable templates while retaining source references: [ADR-0002](decisions/0002-template-snapshot-history-model.md)
- All historical records and statistics are grouped under History: [ADR-0003](decisions/0003-history-information-architecture.md)
- Develop and run locally before a future Vercel/Supabase production phase: [ADR-0004](decisions/0004-local-first-development.md)
- Every architectural decision and affected canonical document stays recorded and current: [ADR-0005](decisions/0005-documentation-as-system-of-record.md)
- Feature testing waits for explicit confirmation of the relevant commit: [ADR-0006](decisions/0006-approval-gated-feature-testing.md)
- Version-controlled repository Markdown is the canonical project-management source of truth: [ADR-0007](decisions/0007-repository-native-project-management.md)
- Managed work uses a Milestone → Feature → Task hierarchy, with Tasks targeted to one delivery commit: [ADR-0008](decisions/0008-milestone-feature-task-hierarchy.md)
- The user is Owner and sole Approver; every Task names an Executor and Reviewer: [ADR-0009](decisions/0009-project-management-roles.md)
- Tasks separate Backlog, execution, review, user approval, authorized testing, and completion: [ADR-0010](decisions/0010-task-lifecycle-and-test-gate.md)
- Work items use immutable `M-###`, `F-###`, and `T-###` identifiers: [ADR-0011](decisions/0011-stable-work-item-identifiers.md)
- Planning uses ordered `Now`, `Next`, and `Later` horizons, one in-progress Task per Executor, and actual event timestamps: [ADR-0012](decisions/0012-now-next-later-planning.md)
- Stable work-item files feed a concise root dashboard and complete registry without moving completed records: [ADR-0013](decisions/0013-project-artifact-layout.md)
- One immutable Task delivery commit is reviewed, approved, and tested; narrow evidence commits record the later events without changing scope: [ADR-0021](decisions/0021-delivery-and-evidence-commit-model.md)
- Explicit Definition of Ready and Definition of Done gates apply to Tasks, Features, and Milestones: [ADR-0015](decisions/0015-readiness-and-completion-gates.md)
- Dashboard and registry reporting keep current work, ownership, timing, approvals, and next action visible: [ADR-0016](decisions/0016-operational-reporting-and-projections.md)
- Runtime uses Next.js 16 Active LTS with App Router, React 19, strict TypeScript, and Node.js 24 LTS: [ADR-0017](decisions/0017-nextjs-app-router-runtime.md)
- Local persistence uses Supabase PostgreSQL, declarative SQL schemas, reviewed versioned migrations, generated TypeScript database types, no initial ORM, and a server-only repository boundary: [ADR-0018](decisions/0018-local-supabase-postgres-and-server-data-access.md)
- The repository contains one npm-managed Next.js app with explicit App Router, feature, server, and shared boundaries; active-workout changes use idempotent revisioned commands and a narrow IndexedDB pending outbox: [ADR-0019](decisions/0019-application-boundaries-and-active-workout-durability.md)
- Mobile UI uses Tailwind CSS 4, application-owned tokens/primitives, and selective Radix; charts use Recharts 3 behind a neutral data boundary; static checks and future approval-gated test tools are explicit: [ADR-0020](decisions/0020-mobile-ui-charting-and-quality-tooling.md)
- External UI/UX work uses an Owner-approved design brief and a separate versioned handoff; fixed visual references define objective fidelity: [ADR-0022](decisions/0022-versioned-external-design-handoff.md)
- The audited v0.4 prototype/specifications override the retained v0.3 PNGs only for documented color/contrast tokens, save/validation/outcome cue placement, and corrected S09/S10 validation fixtures: [`design/T-004-v0.4-frozen/README.md`](design/T-004-v0.4-frozen/README.md)
- Nutrition and calorie tracking are outside product scope, not open questions.
- Local-MVP behavior and release boundary: [`product/mvp-acceptance-criteria.md`](product/mvp-acceptance-criteria.md)

Accepted core product behavior is canonical in the topic documents, not duplicated here.

## Accepted post-MVP or pre-production work

Export/backup, PWA installation, and explicit protection against accidental active-workout closure are accepted post-MVP capabilities. Production-access protection is required before deployment. Active-workout auto-save and restore remain part of the locked local MVP.

## Open questions

These are not decisions and must not be inferred during implementation:

- production protection for the private app;
- PWA implementation details;
- backup/export format and priority;
- whether and how to support estimated 1RM;
- whether and how to support RIR/RPE;
- whether and how to support a rest timer;
- whether and how to model warm-up sets;
- application name;

## Next planned step

Review `T-020` delivery commit `c48cbdcaf0bc348888ef2e1eff7193269a6f049c`, definition-derived set entry. Its component verification stays forbidden until the User approves that exact commit. `T-019` is `Done`: exact approved replacement `e265c48f4e376ccbdcc657eef7930830a0573013` passed the complete verification, and `ADR-0023` is accepted. The clean reset and pgTAP already passed on that commit; only one component assertion was wrong. `T-018` is `Done`: exact approved commit `613dae3da605c329e22e07a82a7b9d1439c0320b` passed its authorized component verification. The User confirmed the per-set control placement for `T-020` and the `app_settings.current_program_id` mechanism for `T-021` on 2026-09-05. `F-011` records the nine corrections the Owner raised on 2026-09-05 after using the delivered application; three of them change accepted decisions and locked criteria and therefore create `ADR-0023`, `ADR-0024`, and `ADR-0025`. `F-008` History and Statistics starts only after `F-011` is complete.

## Implementation status

`F-004`, `F-005`, and `F-006`, including `T-005` through `T-013`, are `Done`. Exact T-014 delivery `4f924d51af2e55681f2e5a517a8963bc58048d81` and exact T-017 correction `8d5779258505bb94383368e13eff97a4346320ca` passed their complete verification. `F-007` is complete with the Owner's confirmed result: exact T-015 second replacement `f52c0447db67007fba7cce8d0c790164e8447fe9` and exact T-016 second replacement `441a87046409d2970de72e5c3f9c1448c4423a4d` both passed their complete verification, and `M-001` stands at `7/11 required Features Done` after `F-011` was added. The delivered `F-005`, `F-006`, and `F-007` behavior still contains the corrections recorded in `F-011` that remain open; until those Tasks are `Done`, the accepted specification for archiving, per-set mode selection, and the focused active-workout shell still describes the current implementation rather than the Owner's corrected intent. Corrections 1, 2, and 4 are complete. Deployment configuration does not exist yet.
