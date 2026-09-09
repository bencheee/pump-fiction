# Architecture decision records

ADRs preserve important cross-cutting product and technical decisions. Removed numbers belonged to the retired development-management process.

| ADR | Status | Decision |
| --- | --- | --- |
| [0001](0001-private-mobile-only-app.md) | Accepted | Private, single-user, mobile-only application |
| [0002](0002-template-snapshot-history-model.md) | Accepted | Mutable templates with immutable-at-creation workout snapshots |
| [0003](0003-history-information-architecture.md) | Superseded in part | Workout and performance history remain under History; ADR-0030 moves body progress |
| [0004](0004-local-first-development.md) | Fulfilled | Local-first development preceded the completed Vercel/Supabase deployment |
| [0017](0017-nextjs-app-router-runtime.md) | Accepted | Next.js 16 App Router, React 19, strict TypeScript, and Node.js 24 LTS |
| [0018](0018-local-supabase-postgres-and-server-data-access.md) | Accepted | Local Supabase PostgreSQL, declarative SQL schemas, and server-only data access |
| [0019](0019-application-boundaries-and-active-workout-durability.md) | Accepted | Single-app boundaries and durable command outbox for active workouts |
| [0020](0020-mobile-ui-charting-and-quality-tooling.md) | Accepted | Mobile UI, charting, static checks, and test tooling |
| [0023](0023-simplified-exercise-load-mode-model.md) | Accepted | Implied base load mode plus at most one optional addition; no standalone band type |
| [0024](0024-deletion-with-preserved-history.md) | Accepted | Deletion replaces archiving; snapshots and optional references keep History intact |
| [0025](0025-active-workout-in-the-main-shell.md) | Accepted | The active workout keeps the bottom navigation; the focused shell is removed |
| [0026](0026-two-exercise-types-with-assistance-under-bodyweight.md) | Accepted | Two exercise types; assistance becomes a bodyweight option and supersedes the ADR-0023 type table |
| [0027](0027-a-set-is-recorded-by-its-values.md) | Accepted | Explicit set confirmation is removed; a set counts once its values are complete |
| [0029](0029-one-visibility-rule-for-test-support-routes.md) | Accepted | Both test-support routes are hidden unless `PF_ENABLE_TEST_SUPPORT` is set, so one production server runs the whole browser suite |
| [0030](0030-body-is-its-own-destination.md) | Accepted | Weight and body measurements become a fifth destination that reads and corrects; today's values are entered on Today |
| [0031](0031-shared-password-protects-the-hosted-application.md) | Accepted | One shared password gates the hosted application; the database stays closed by grant rather than by Row Level Security |

## Lifecycle

New cross-cutting decisions receive the next number and include Status, Context, Decision, Consequences, and Related documents. If a retained product or technical decision changes, add the replacement ADR, mark the old one `Superseded`, and link both records.
