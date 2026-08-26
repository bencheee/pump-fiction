# Screen and state manifest

This manifest defines design coverage, not final implementation routing. Route labels provide stable handoff references. Bottom navigation appears only on normal-shell routes; overlays retain their parent context.

## Screen and route inventory

| ID | Route or overlay | Screen | Required content and variants |
| --- | --- | --- | --- |
| `S01` | `/today` | Today | Date; proposed next split; historical average when available; **Start Workout**; alternate split; one-time workout; conditional today-weight prompt; current-workout restore card when applicable |
| `S02` | `/today` → sheet | Choose another split | Active-program split choices; chosen split applies to one workout only; empty/no-alternative explanation |
| `S03` | `/today/one-time` | One-time workout builder | Arbitrary workout name; ordered active-exercise selection; add/remove/reorder; start action; validation |
| `S04` | `/today` → sheet | Today weight entry | Today-fixed decimal kg input; save lifecycle; duplicate-resolved state |
| `S05` | `/exercises` | Exercise Library | Searchable active list; archived filter/section; add action; empty and no-results states; no performance statistics |
| `S06` | `/exercises/new`, `/exercises/:id/edit` | Exercise form | Name, type, allowed modes, persistent note; create/edit; split-usage warning; archive/reactivate; validation and confirmation variants |
| `S07` | `/programs` | Programs | Active, draft, and archived programs; active program's next-split marker; add action; empty state |
| `S08` | `/programs/new`, `/programs/:id/edit` | Program form/detail | Name, status, ordered splits, next marker, visible drag handles, add/edit split, save draft, activate, set next, archive/reactivate variants |
| `S09` | `/programs/:programId/splits/new`, `/programs/:programId/splits/:id/edit` | Split form | Name; ordered exercises; planned sets and rep range; add/remove/reorder; archive/reactivate; duplicate/last-active validation |
| `S10` | `/workout/current` | Active or paused workout | Focused shell; timer; save status; exercise cards; snapshot note; Last time; exact initial sets; per-set mode/fields/confirm; add/remove/reorder; workout note; pause/continue; finish |
| `S11` | `/workout/current` → sheet | Add workout exercise | Search and choose from active Exercise Library only; no-results state |
| `S12` | `/workout/current/finish` | Finish review | Duration, exercise count, confirmed-set count, empty planned sets; complete, incomplete, continue, and separately confirmed discard |
| `S13` | `/history/workouts` | Workout History | Newest-first monthly groups; date, snapshot name, active duration, performed exercise count, incomplete marker; empty/loading states |
| `S14` | `/history/workouts/:id`, `/history/workouts/:id/edit` | Workout detail/edit | Snapshot timing/source/exercises/prescriptions/sets/notes; edit documented fields; mark incomplete workout completed; delete confirmation; recalculation feedback |
| `S15` | `/history/exercises` | Exercise History | Searchable exercises with historical performances, including archived; latest-performance summaries; empty/no-results states |
| `S16` | `/history/exercises/:id` | Exercise progress detail | Latest eligible performance, PR categories, metric and range selectors, chart, accessible data/performance list, notes, workout links, band-category separation |
| `S17` | `/history/splits` | Split History | Program filter; persistent split identity; completed count, average duration, latest date; empty states |
| `S18` | `/history/splits/:id` | Split progress detail | Count; total/average/shortest/longest/latest duration; range selector; duration chart; accessible workout list |
| `S19` | `/history/weight` | Weight | Latest; individual change; weekly average/change/`n/7`; provisional state; range selector; daily plus weekly-average chart; entries; add/edit/delete |
| `S20` | `/history/weight/new`, `/history/weight/:date/edit` | Weight entry | Date and decimal kg; retrospective dates; future/duplicate validation; save lifecycle; delete confirmation in edit mode |
| `S21` | `/history/body` | Body measurement types | Active and archived custom types; latest value/change; add, archive, reactivate; empty states |
| `S22` | `/history/body/types/new`, `/history/body/types/:id/edit` | Measurement type form | Arbitrary unique-enough display name; fixed `cm`; create/edit; archive/reactivate and confirmation variants |
| `S23` | `/history/body/:typeId` | Measurement detail | Latest/date, latest change, total change, range selector, chart, accessible entry list, add/edit/delete; no good/bad semantic coloring |
| `S24` | `/history/body/:typeId/new`, `/history/body/:typeId/:date/edit` | Measurement entry | Date and decimal cm; retrospective dates; future/duplicate validation; save lifecycle; delete confirmation in edit mode |

## Shared overlays and feedback

| ID | Overlay or feedback | Applies to |
| --- | --- | --- |
| `O01` | Destructive confirmation with explicit target and cancel-safe default | Populated workout set/exercise removal, workout discard, historical workout deletion, weight/measurement entry deletion, archive actions where loss of new selection must be clear |
| `O02` | Load-mode chooser and field swap | Every configurable set on `S10` and historical set edit on `S14` |
| `O03` | Save indicator: `Saving…`, `Saved`, `Couldn't save — Retry` | Auto-save screens and explicit-save forms |
| `O04` | Reorder mode with visible drag handle, focus/keyboard equivalent, and saved-order feedback | `S03`, `S08`, `S09`, `S10`, `S14` |
| `O05` | Archived badge/filter and reactivate action | `S05`–`S09`, `S15`, `S17`, `S21`, `S22` |
| `O06` | Incomplete badge and excluded-from-statistics explanation | `S13`, `S14`, `S12` save-incomplete outcome |
| `O07` | Restored-workout banner/card explaining persisted state and timer status | `S01`, `S10` |

## Required state coverage

Legend: `P` primary frame, `V` documented variant/overlay, `—` not applicable.

| Screen | Initial | Populated | Empty | Loading | Validation | Saving | Saved | Failure | Destructive | Archived | Incomplete | Restored |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `S01` | `P` | `P` | `V` | `V` | — | `V` | `V` | `V` | — | — | — | `V` |
| `S02` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | — | — | — |
| `S03` | `P` | `P` | `V` | `V` | `V` | `V` | `V` | `V` | `V` | — | — | — |
| `S04` | `P` | — | — | — | `V` | `V` | `V` | `V` | — | — | — | — |
| `S05` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | `V` | — | — |
| `S06` | `P` | `P` | — | `V` | `V` | `V` | `V` | `V` | `V` | `V` | — | — |
| `S07` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | `V` | — | — |
| `S08` | `P` | `P` | `V` | `V` | `V` | `V` | `V` | `V` | `V` | `V` | — | — |
| `S09` | `P` | `P` | `V` | `V` | `V` | `V` | `V` | `V` | `V` | `V` | — | — |
| `S10` | `P` | `P` | — | `V` | `V` | `V` | `V` | `V` | `V` | — | — | `V` |
| `S11` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | — | — | — |
| `S12` | `P` | `P` | — | `V` | — | `V` | `V` | `V` | `V` | — | `V` | — |
| `S13` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | — | `V` | — |
| `S14` | `P` | `P` | — | `V` | `V` | `V` | `V` | `V` | `V` | — | `V` | — |
| `S15` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | `V` | — | — |
| `S16` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | `V` | — | — |
| `S17` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | `V` | — | — |
| `S18` | `P` | `P` | `V` | `V` | — | — | — | `V` | — | `V` | — | — |
| `S19` | `P` | `P` | `V` | `V` | — | `V` | `V` | `V` | `V` | — | — | — |
| `S20` | `P` | `P` | — | `V` | `V` | `V` | `V` | `V` | `V` | — | — | — |
| `S21` | `P` | `P` | `V` | `V` | — | — | — | `V` | `V` | `V` | — | — |
| `S22` | `P` | `P` | — | `V` | `V` | `V` | `V` | `V` | `V` | `V` | — | — |
| `S23` | `P` | `P` | `V` | `V` | — | `V` | `V` | `V` | `V` | `V` | — | — |
| `S24` | `P` | `P` | — | `V` | `V` | `V` | `V` | `V` | `V` | — | — | — |

Skeleton loading must preserve layout without fake data. Empty states explain the next valid action. Save failure never implies data was persisted; retry remains visible. A success message must not block continued entry.

## Critical end-to-end flows

1. Proposed split: `S01 → S10 → S12 → S13/S14`, then return to `S01` with the next rotation split advanced.
2. Today-only alternate: `S01 → S02 → S10 → S12`; completion records split statistics but leaves rotation unchanged.
3. One-time workout: `S01 → S03 → S10 → S12`; exercise statistics update, split statistics and rotation do not.
4. Restore: reopen to `S01` restore card or directly `S10`; active timer resumes accurately and paused timer remains paused.
5. Exercise setup: `S05 → S06`; create/edit/archive/reactivate with type/mode validation and split-usage warning.
6. Program setup: `S07 → S08 → S09 → S08`; draft, activation with first-next choice, reorder, explicit set-next, archive/reactivate.
7. Historical correction: `S13 → S14 edit → saved`; derived statistics and Last time update while templates and rotation remain unchanged.
8. Progress review: `S15 → S16`, `S17 → S18`, `S19`, and `S21 → S23`, each with chart plus textual/list representation.
9. Daily tracking: `S01 → S04` or `S19 → S20`; Body uses `S21 → S23 → S24`.
