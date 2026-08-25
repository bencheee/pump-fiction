# ADR-0007: Repository-native project management

- **Status:** Accepted

## Context

Project state must remain available to every future Codex session and must not depend on chat history, an external account, or an unavailable integration. Using multiple authoritative systems would also create a persistent risk of drift.

## Decision

Use version-controlled Markdown in this repository as the single canonical source of truth for project management.

All authoritative work-item state, ownership, timing, dependencies, approvals, commit linkage, documentation impact, and test authorization records must be represented in repository files. External tools may later provide convenience views or notifications, but they are non-canonical and must not contain project state that is absent from the repository.

The exact Markdown artifacts, hierarchy, identifiers, statuses, and transitions remain to be defined in the project-management refinement.

## Consequences

- Every future agent can recover project state by reading the repository.
- Project-management changes are versioned and auditable alongside code and documentation.
- No external connector is required to determine the current state or next action.
- The workflow must keep active views concise while retaining completed history.
- If an external view disagrees with repository Markdown, the repository wins.

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`../process/development-governance.md`](../process/development-governance.md)
- [`../PROJECT_STATE.md`](../PROJECT_STATE.md)
