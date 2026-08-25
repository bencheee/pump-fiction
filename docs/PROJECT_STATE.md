# Project state

## Current phase

The functional specification, textual mobile-wireframe decisions, local-MVP acceptance criteria, development governance, repository-native project-management system, and local technical architecture are accepted. User approval of the first `T-001` delivery SHA was invalidated before testing because a required canonical lifecycle-marker correction changes the delivery tree. Application implementation has not started.

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
- UI language;
- application name;

## Next planned step

Correct the canonical architecture lifecycle marker and evidence-boundary rule, then create and review the replacement [`T-001`](project/tasks/T-001-define-local-technical-architecture.md) delivery SHA. Implementation initialization remains a separate future Task.

## Implementation status

No framework, dependency, database, migration, deployment configuration, or application code exists yet.
