# ADR-0028: Replacements inherit the Task approval

- **Status:** Accepted — directed by the Owner on 2026-09-06

## Context

Under [ADR-0010](0010-task-lifecycle-and-test-gate.md) and [ADR-0021](0021-delivery-and-evidence-commit-model.md), every replacement delivery needed a fresh approval before its verification could run. A replacement is by definition a correction inside an already approved scope, but the rule treated it as a new decision.

During `F-008` that cost the Owner more than ten approval cycles in one day. Five of the seven failed verifications were defects in test source the Executor had written but was forbidden to run, such as an ambiguous query or a wrong expected value; the correction changed nothing the Owner had approved. Two were real behavior defects the tests rightly caught, and their corrections were small and within the Task's scope. In every case the Owner's answer was the same word.

The Owner directed on 2026-09-06 that this stop.

## Decision

The Owner approves a Task's **first** delivery commit. That approval covers the Task's scope, not one SHA.

Every later **replacement** within the same Task inherits that approval, provided all of the following hold:

- the replacement stays within the Task's recorded scope and acceptance criteria; a change that would alter them is a new Task, as ADR-0010 already requires;
- the replacement is recorded exactly as before: its own delivery commit, an evidence commit naming the SHA, the transition history, and the reason for the replacement;
- the Executor re-runs the **complete** recorded plan from the beginning against the exact replacement, never a subset;
- the Owner has not revoked the inherited approval for that Task.

The Executor therefore proceeds from a failed verification to the corrected replacement and its re-verification without asking. The Owner sees the final approved SHA and the complete verification record when the Task reaches `Done`, and reviews the Feature result as before.

The Owner may revoke at any time, for one Task or for all, with one message. A rejection of any delivery returns the Task to `In Progress` and ends inheritance for it until the Owner approves again.

Nothing else moves. No feature test runs on a Task before its first approval. Static checks stay permitted before it. Evidence commits stay path-limited.

## Consequences

- One approval per Task in the normal case, instead of one per replacement.
- The feature-testing gate keeps its purpose: nothing is tested before the Owner has authorized the Task's scope and first delivery.
- The Executor carries more responsibility to keep replacements small and honest, and to record them fully; the record is what the Owner reviews at `Done`.
- The `Approved` fields in a Task record the first approval and note each inherited replacement instead of being cleared and re-filled.
- `T-034` second replacement `4d4f895fc5807cffb172ec5d2a343d68bca31b8e` is the first to inherit, on the Owner's direction the same day.

## Supersedes and refines

- Refines the transition rule in [ADR-0010](0010-task-lifecycle-and-test-gate.md) that a changed commit clears approval: it now clears approval only when the change leaves the Task's scope or the Owner rejects it.
- Refines the exact-SHA rule in [ADR-0021](0021-delivery-and-evidence-commit-model.md): verification still binds to one exact SHA per run, and the record still names it, but the approval that authorizes the run is the Task's.

## Related documents

- [`../process/development-governance.md`](../process/development-governance.md)
- [`../process/project-management.md`](../process/project-management.md)
- [`../project/tasks/T-034-build-exercise-history-mobile-experience.md`](../project/tasks/T-034-build-exercise-history-mobile-experience.md)
