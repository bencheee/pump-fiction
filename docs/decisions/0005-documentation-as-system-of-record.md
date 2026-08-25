# ADR-0005: Documentation as the system of record

- **Status:** Accepted

## Context

Future Codex sessions and development work must understand the current product and architecture without depending on chat history or undocumented assumptions. Stale or incomplete documentation would make architectural evolution unsafe and untraceable.

## Decision

Treat repository documentation as a required, continuously maintained system of record. Every architectural decision receives an ADR, and every affected canonical document is updated in the same task as the decision or implementation change.

An architectural change is not complete while its documentation is missing, stale, or contradictory. Decisions may not live only in chat, code, or commit messages. When a decision changes, preserve the old record and explicitly supersede it.

## Consequences

- Documentation work is included in every relevant work item and completion check.
- Future agents must consult accepted decisions before implementation.
- Undocumented architectural drift is treated as a blocker, not as an acceptable shortcut.
- Project-management records must link work to affected ADRs and canonical documents.
- Changes may take slightly longer, but their rationale and current state remain recoverable.

## Related documents

- [`../process/development-governance.md`](../process/development-governance.md)
- [`../process/project-management.md`](../process/project-management.md)
- [`../architecture/constraints.md`](../architecture/constraints.md)
- [`../../AGENTS.md`](../../AGENTS.md)
