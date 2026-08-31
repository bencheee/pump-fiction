# Documentation index

Use this file as a router. Read only the documents needed for the current task and follow their links when a dependency is relevant.

| Task or question | Canonical document |
| --- | --- |
| Product scope, Today, top-level navigation | [`product/overview.md`](product/overview.md) |
| MVP scope, acceptance, implementation-plan traceability | [`product/mvp-acceptance-criteria.md`](product/mvp-acceptance-criteria.md) |
| Exercise model, load modes, notes, archiving | [`product/exercises.md`](product/exercises.md) |
| Programs, splits, ordering, activation, rotation | [`product/programs-and-splits.md`](product/programs-and-splits.md) |
| Active workout, sets, timer, completion | [`product/workouts.md`](product/workouts.md) |
| Workout/exercise/split history, PRs, charts | [`product/history-and-statistics.md`](product/history-and-statistics.md) |
| Weight and body measurements | [`product/weight-and-body.md`](product/weight-and-body.md) |
| Mobile information architecture and navigation | [`ux/mobile-information-architecture.md`](ux/mobile-information-architecture.md) |
| Screen contents and interaction decisions | [`ux/wireframe-decisions.md`](ux/wireframe-decisions.md) |
| Entities, relationships, snapshots, derived data | [`architecture/domain-model.md`](architecture/domain-model.md) |
| Technical constraints, local development, production direction | [`architecture/constraints.md`](architecture/constraints.md) |
| Accepted local technical architecture and explicitly deferred production choices | [`architecture/local-technical-architecture.md`](architecture/local-technical-architecture.md) |
| Documentation obligations, commit approval, testing gate | [`process/development-governance.md`](process/development-governance.md) |
| Accepted project-management workflow and evidence model | [`process/project-management.md`](process/project-management.md) |
| External UI/UX design brief, handoff, and fidelity process | [`process/design-collaboration.md`](process/design-collaboration.md) |
| Current versioned outbound mobile-design brief package | [`design/T-003-v1/README.md`](design/T-003-v1/README.md) |
| Audited external mobile-design handoff candidate | [`design/T-004-v0.4-frozen/README.md`](design/T-004-v0.4-frozen/README.md) |
| Current operational focus and next work | [`../PROJECT.md`](../PROJECT.md) |
| Complete work-item registry and next IDs | [`project/INDEX.md`](project/INDEX.md) |
| Current phase, open questions, next step | [`PROJECT_STATE.md`](PROJECT_STATE.md) |
| Accepted architectural/product decisions | [`decisions/README.md`](decisions/README.md) |

Documentation maintenance rules are in [`process/development-governance.md`](process/development-governance.md#documentation-as-part-of-the-work).

## Context budget

For a new work session, load this router first. For managed delivery work, add the small root dashboard and only its linked active Task. Load canonical topic documents and accepted ADRs only when the Task actually touches them; never preload all of `docs/`, all ADRs, completed Tasks, the full registry, or design exports.

Task files point to canonical requirements by stable ID and link instead of copying their full text. Detailed design packages are loaded only for design or UI implementation/review work.
