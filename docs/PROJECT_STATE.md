# Project state

## Current phase

The functional specification, textual mobile-wireframe decisions, local-MVP acceptance criteria, development governance, repository-native project-management system, local technical architecture, MVP Feature breakdown, and external UI/UX collaboration process are accepted. `F-004` Application and Data Foundation, `F-005` Exercise Library, `F-006` Programs and Splits, `F-007` Today and Active Workout, and `F-011` MVP Experience Corrections are complete, the last with the Owner's confirmed feature result covering Today, workout start, the active workout, and the finish review.

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

`T-027` delivery `9b8247f73bf9347cdd44f23e5172c16b9b99cfae` is approved and verified, so a clean reset now lands on the committed seed baseline and `npm run db:snapshot` and `npm run db:restore` carry the Owner's own data across a verification. `F-013` is `Done` with the Owner's confirmed result on `2026-09-05`: a reset lands on the committed seed baseline, `npm run db:snapshot` and `npm run db:restore` carry the Owner's own data across a verification, the repository suite no longer leaves an exercise behind, and its need for a database without a resumable workout is recorded next to the verification gate. `F-014` is now the current focus: `T-028` reduces the exercise types to `weights` and `bodyweight` under [ADR-0026](decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md). Its first delivery failed on exercise-form component tests it had not updated; approved replacement `14fdd0ac8785127e2407584afd9a201aeaeb2cb2` then passed complete verification, so `T-028` is `Done`. `T-029` removes explicit set confirmation under [ADR-0027](decisions/0027-a-set-is-recorded-by-its-values.md): `workout_sets.is_confirmed` is dropped and whether a set counts is derived from its values. `F-014` is `Done` with the Owner's confirmed result on `2026-09-05`. `F-012` is now the current focus: `T-026` delivery `90875783eda308cdb95b33ad43a336bbd6060ccd` is approved and verified, so a refused command is now terminal, the client refreshes and replays the rest without waiting for a gesture, and the screen names the lost change. `F-012` is `Done` with the Owner's confirmed result on `2026-09-05`, and `M-001` stands at 11/14 required Features Done. The Owner directed on the same day that `F-008` History and Statistics is not to be started; it also still has no Task breakdown, and its scope boundary against `F-009` is part of that planning. There is no active work item. `F-008` follows. On `2026-09-05` the Owner asked for the `F-008` Task breakdown without starting implementation: `T-031` through `T-036` are recorded in `Backlog`, operations before screens, and the Feature file carries the proposed History-shell boundary against `F-009` and six readiness questions, chiefly whether a never-nulled identity snapshot should preserve exercise and split identity after deletion. On the same day the Owner released the hold, accepted every recommended answer and local decision, and gave the go-ahead for the whole Feature, so `T-031` was delivered and approved as `95de9212848755c956cb0dc5d50b5cfc8796dc27` on `2026-09-05`. Its authorized verification then failed on two prepared pgTAP suites: the schema change was not carried into the direct `workout_exercises` inserts of the core-constraints suite, and the new History suite started a split as an alternate after rotation had already made it the proposed one. Both were test-source defects, so replacement `b5e4cda609d478453eccd562087d1f18bfec7f54` corrects the two suites and one inaccurate sentence about what a correction returns. The Owner approved that replacement on `2026-09-05`, and its verification then passed pgTAP 112/112, unit 86/86, and the generated-type comparison before the repository script failed: it runs its files in parallel against one shared database, and this Task added a third file that starts a workout. Second replacement `c00c6e92072c98aec5e0e449797bb154bf314ccf` serializes that script with `--no-file-parallelism` and records why serial execution is a correctness requirement; the Owner approved it on `2026-09-05` and the complete plan then passed: pgTAP 112/112, repository 5/5, unit 86/86, matching generated types, and a faithful restore. `T-031` is `Done`, so History now has its reads and its ten transactional corrections, and `T-032` delivered the History shell and the Workouts subsection on them as `578cd501bf6c2ee405ca33fd9678eb9835a1fd94`. The Owner approved it and its verification passed unit and component 98/98 before the browser scenario found a real defect: an empty historical set offered no load field, because the correction form read the set's mode column instead of deriving the mode from the exercise definition as ADR-0023 requires. Replacement `c2b6fa124ed3cb327f756fc7a6fd74bd3080bdcf` derives the mode from the definition, offers the optional addition per set, and the Owner approved it on `2026-09-05`, and its verification then passed unit and component 99/99 and cleared the correction in the browser, confirming the fix, before an ambiguous Today assertion in the test itself stopped the scenario. Second replacement `35790c78201f76c0c2cec3c76bddaa8415c9727a` scopes that assertion and the four others whose names repeat on the page, and the Owner approved it on `2026-09-05`, so the complete plan is running against it from the beginning. Preparing its browser scenario surfaced `T-037`: two older browser specs still call the archiving artifacts `T-021` removed, so the browser suite cannot run as a whole. The accepted answers add a never-nulled identity snapshot for exercises and splits, keep recorded active duration out of historical editing, allow only the incomplete-to-completed direction, run corrections as ordinary transactional server actions, and give `F-008` the History shell with placeholder Weight and Body routes for `F-009`. The reconfirmed working order is `F-013`, then `F-014` with `T-028` before `T-029`, then `F-012`, then `F-008`. The Owner confirmed on `2026-09-05` that both mechanisms are built, with the seed as the fallback when no snapshot exists. `F-014` then delivers the Owner's two new model corrections: two exercise types with assistance under bodyweight, and a set recorded by its entered values with no confirmation control. The Owner set that order on 2026-09-05 and reconfirmed it the same day, when the `Next` numbering was corrected to match the Feature files.

## Implementation status

`F-004`, `F-005`, and `F-006`, including `T-005` through `T-013`, are `Done`. Exact T-014 delivery `4f924d51af2e55681f2e5a517a8963bc58048d81` and exact T-017 correction `8d5779258505bb94383368e13eff97a4346320ca` passed their complete verification. `F-007` is complete with the Owner's confirmed result: exact T-015 second replacement `f52c0447db67007fba7cce8d0c790164e8447fe9` and exact T-016 second replacement `441a87046409d2970de72e5c3f9c1448c4423a4d` both passed their complete verification, and `M-001` stands at `7/11 required Features Done` after `F-011` was added. All nine corrections are complete, so the delivered behavior and the accepted specification agree again. Deployment configuration does not exist yet.
