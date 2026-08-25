# Pump Fiction agent guide

This repository (working title: Pump Fiction) specifies a private, single-user, mobile-only web app for recording gym workouts and body progress. The user-facing app name is not yet decided.

## Project boundaries

- Design for phones only; do not create or optimize a desktop experience.
- Nutrition and calorie tracking are out of scope.
- The repository is currently documentation-only and implementation has not started. Accepted framework, persistence, application-boundary, UI, charting, and quality choices are canonical in [`docs/architecture/local-technical-architecture.md`](docs/architecture/local-technical-architecture.md); do not invent choices beyond it or initialize implementation outside a ready Task.
- Do not add features that have not been explicitly agreed.

## Required context flow

1. Before working, read [`docs/INDEX.md`](docs/INDEX.md).
2. For planning, implementation, review, commit, or testing work, also read the small [`PROJECT.md`](PROJECT.md) dashboard and the linked active work item.
3. Use the index to read only the documents relevant to the task. Do not load all of `docs/` without a concrete need.
4. Before changing behavior, check the relevant accepted decisions and canonical specification.
5. When behavior changes, update its canonical documentation in the same task.

Documentation is part of the work, not a follow-up. Record every architectural decision in an ADR and update every affected canonical document in the same task. An architectural change is not complete while its documentation is missing or stale. Record a small local decision in its canonical topic document. Never silently change an accepted decision. Mark unresolved choices as open questions instead of inventing answers.

Do not run automated or manual feature tests until the user explicitly confirms that the relevant commit is fully approved. Implementation or commit authorization does not imply test authorization. After confirmation, test only the approved feature/commit scope. Read [`docs/process/development-governance.md`](docs/process/development-governance.md) before implementation, commit, or testing work.

Formatting, linting, type checking, compilation/build, and documentation-link validation are permitted static checks before approval. Record them in the Task; never treat them as permission to run feature tests.

A Task targets one delivery commit. Review, approval, testing, and completion are recorded afterward through path-limited evidence commits as defined by [ADR-0021](docs/decisions/0021-delivery-and-evidence-commit-model.md); evidence commits never change delivered scope.

If code and documentation disagree, report the mismatch. Documentation describes currently agreed behavior, not aspirational features; avoid duplicating the same specification across documents.
