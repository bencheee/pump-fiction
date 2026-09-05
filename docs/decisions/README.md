# Architecture decision records

ADRs preserve important cross-cutting product, technical, and delivery-governance decisions.

| ADR | Status | Decision |
| --- | --- | --- |
| [0001](0001-private-mobile-only-app.md) | Accepted | Private, single-user, mobile-only application |
| [0002](0002-template-snapshot-history-model.md) | Accepted | Mutable templates with immutable-at-creation workout snapshots |
| [0003](0003-history-information-architecture.md) | Accepted | Historical data and statistics grouped under History |
| [0004](0004-local-first-development.md) | Accepted | Local-first development before Vercel/Supabase production |
| [0005](0005-documentation-as-system-of-record.md) | Accepted | Documentation is the continuously maintained system of record |
| [0006](0006-approval-gated-feature-testing.md) | Accepted | Feature testing requires explicit approval of the relevant commit |
| [0007](0007-repository-native-project-management.md) | Accepted | Repository Markdown is the project-management source of truth |
| [0008](0008-milestone-feature-task-hierarchy.md) | Accepted | Project work uses a Milestone → Feature → Task hierarchy |
| [0009](0009-project-management-roles.md) | Accepted | The user owns scope and final approval; Tasks name Executor and Reviewer |
| [0010](0010-task-lifecycle-and-test-gate.md) | Accepted | Tasks separate implementation, review, approval, testing, and completion |
| [0011](0011-stable-work-item-identifiers.md) | Accepted | Work items use immutable `M-###`, `F-###`, and `T-###` identifiers |
| [0012](0012-now-next-later-planning.md) | Accepted | Planning uses ordered Now, Next, and Later horizons with actual timestamps |
| [0013](0013-project-artifact-layout.md) | Accepted | Stable work-item files feed a concise dashboard and complete registry |
| [0014](0014-commit-approval-and-verification-records.md) | Superseded | Original self-referential commit-evidence model; replaced by ADR-0021 |
| [0015](0015-readiness-and-completion-gates.md) | Accepted | Explicit readiness and completion gates apply at every work-item level |
| [0016](0016-operational-reporting-and-projections.md) | Accepted | Dashboard and registry project current work and auditable history |
| [0017](0017-nextjs-app-router-runtime.md) | Accepted | Next.js 16 App Router, React 19, strict TypeScript, and Node.js 24 LTS |
| [0018](0018-local-supabase-postgres-and-server-data-access.md) | Accepted | Local Supabase PostgreSQL, declarative SQL schemas, and server-only data access |
| [0019](0019-application-boundaries-and-active-workout-durability.md) | Accepted | Single-app boundaries and durable command outbox for active workouts |
| [0020](0020-mobile-ui-charting-and-quality-tooling.md) | Accepted | Mobile UI, charting, static checks, and approval-gated future test tooling |
| [0021](0021-delivery-and-evidence-commit-model.md) | Accepted | One Task delivery commit plus narrow repository-native evidence commits |
| [0022](0022-versioned-external-design-handoff.md) | Accepted | Versioned external design brief, structured handoff, and fixed-reference fidelity |
| [0023](0023-simplified-exercise-load-mode-model.md) | Accepted | Implied base load mode plus at most one optional addition; no standalone band type |

## Lifecycle

New cross-cutting decisions receive the next number and include Status, Context, Decision, Consequences, and Related documents. Do not delete or rewrite accepted decision history without trace. If a decision changes, add the replacement ADR, mark the old one `Superseded`, and link both records.
