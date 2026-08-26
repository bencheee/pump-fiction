# MVP criteria-to-screen map

All 57 locked criteria have at least one primary design surface. The canonical wording remains in [`mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md); this map adds no behavior.

| Criterion | Primary screens | Required design evidence |
| --- | --- | --- |
| `MVP-REL-001` | `S01`–`S24` | Phone-only shell; no login/account, nutrition, calories, or desktop layout |
| `MVP-REL-002` | `S01`, `S05`, `S07`, `S13`–`S24`, `S10` | Exactly four bottom destinations outside the focused active-workout shell |
| `MVP-REL-003` | `S01`, `S05`, `S07`, `S10`, `S13`, `S19`, `S21` | Persisted populated states and explicit restored-current-workout treatment |
| `MVP-REL-004` | `S06`, `S08`, `S09`, `S14`–`S18` | Future-only edit messaging; saved snapshots remain stable; correction feedback recalculates derived views |
| `MVP-TOD-001` | `S01` | Date, proposed split, optional average, dominant **Start Workout** |
| `MVP-TOD-002` | `S01`, `S02`, `S10`, `S12` | Today-only wording and unchanged-rotation explanation |
| `MVP-TOD-003` | `S01`, `S03`, `S10`, `S12` | Custom name/exercises; no split/rotation implication |
| `MVP-TOD-004` | `S01`, `S04` | Prompt shown only before today's entry; saved replacement state |
| `MVP-EXE-001` | `S05`, `S06` | Name/type/modes/note form and unique-name/type-mode errors |
| `MVP-EXE-002` | `S06`, `S10`, `S14`, `O02` | Weights kg/reps and optional resistance-band selector, never assistance band |
| `MVP-EXE-003` | `S06`, `S10`, `S14`, `O02` | Bodyweight, added kg, resistance band, assistance band as mutually exclusive per-set modes |
| `MVP-EXE-004` | `S06`, `S10`, `S14`, `O02` | Assisted kg/band variants and standalone resistance-band fields |
| `MVP-EXE-005` | `S10`, `S14`, `S16` | Separate direction and strength labels/categories |
| `MVP-EXE-006` | `S06`, `S10`, `S14` | Editable library note; read-only snapshotted workout note |
| `MVP-EXE-007` | `S06` | Split usage count and future-workouts-only warning |
| `MVP-EXE-008` | `S05`, `S06`, `S15`, `S16`, `O05` | Archive removes new-selection affordance but preserves History; reactivate action |
| `MVP-PRG-001` | `S07`, `S08` | Draft/active/archived states; activation/reactivation selects next split; one-active-program feedback |
| `MVP-PRG-002` | `S09` | Unique split name, no duplicate exercise, positive planned/reps and min≤max errors |
| `MVP-PRG-003` | `S08`, `S09`, `O04` | Visible drag handles; current-next identity remains marked; saved-order feedback |
| `MVP-PRG-004` | `S08`, `S01`, `S02` | Persistent **Set as Next** visually distinct from today-only selection |
| `MVP-PRG-005` | `S01`, `S10`, `S12`, `S08` | Rotation moves only after completing the proposed split, not at start/incomplete/discard/history edit/delete |
| `MVP-PRG-006` | `S02`, `S03`, `S12`, `S14` | Alternate/one-time/incomplete-later outcomes explicitly leave rotation unchanged |
| `MVP-PRG-007` | `S08`, `S09`, `O01`, `O05` | Archived split treatment, changed-next feedback, and last-active-split rejection |
| `MVP-WRK-001` | `S10`, `S14` | Snapshot names, notes, prescription, ordering, and source identity represented |
| `MVP-WRK-002` | `S09`, `S10` | Exact planned rows initially; **Add set** and remove actions without implying a maximum |
| `MVP-WRK-003` | `S10`, `S14`, `O02` | Independent mode per set, applicable fields only, inline errors, disabled/unavailable confirm when incomplete |
| `MVP-WRK-004` | `S10`, `S14`, `O03`, `O04` | Immediate/auto-save feedback for every editable workout element; no workout-wide Save button |
| `MVP-WRK-005` | `S01`, `S10`, `O07` | One current-workout restore and active-versus-paused timer treatment |
| `MVP-WRK-006` | `S10`, `S14`, `S16` | **Last time** content by identity and completed eligibility; correction result visible |
| `MVP-WRK-007` | `S10`, `S14`, `S16` | Separate editable Today's note and historical occurrence note |
| `MVP-WRK-008` | `S10`, `S11`, `O04` | Add/reorder/remove active-library exercises; source split unaffected messaging |
| `MVP-WRK-009` | `S10`, `O01` | Confirmation only for populated set/exercise removal |
| `MVP-WRK-010` | `S10` | Running/paused timer; **Continue Later**; resume retains accumulated duration |
| `MVP-WRK-011` | `S12`, `O01` | Required review metrics and four outcomes, discard separately confirmed |
| `MVP-WRK-012` | `S12`, `S13`, `S14`, `O06` | Completed/incomplete/discard outcomes and eligibility/rotation explanation |
| `MVP-HIS-001` | `S13`, `S15`, `S17`, `S19`, `S21` | Five History subsections; statistics absent from library/template ownership |
| `MVP-HIS-002` | `S13`, `S14` | Month grouping, newest first, summary fields, incomplete marker, full saved snapshot detail |
| `MVP-HIS-003` | `S14`, `S16`, `S18` | Editable documented fields; recalculation success; no template/rotation implication |
| `MVP-HIS-004` | `S14`, `O01`, `S16`, `S18` | Confirmed delete and affected-statistics recalculation feedback |
| `MVP-HIS-005` | `S15`, `S16`, `S14`, `O05` | Archived historical exercises retained; combined identity-based performances with workout links |
| `MVP-HIS-006` | `S12`–`S18`, `O06` | Clear completed/confirmed eligibility; incomplete and one-time split-stat exclusions |
| `MVP-HIS-007` | `S16` | Weights PR cards and no-band/resistance-strength category separation |
| `MVP-HIS-008` | `S16` | Bodyweight, added-weight, and assisted PR variants; lower assistance treatment |
| `MVP-HIS-009` | `S16` | Direction/strength filters or grouping; no kg conversion/ranking across band categories |
| `MVP-HIS-010` | `S16` | Applicable metric/range selectors, chart/list pairing, lower-assistance progress cue |
| `MVP-HIS-011` | `S17`, `S18` | Program identity/filter; count and all duration aggregates/chart/list; exclusions |
| `MVP-WGT-001` | `S19`, `S20`, `O01` | One decimal kg/date, today default, retrospective edit, future/duplicate errors, delete |
| `MVP-WGT-002` | `S19` | Monday–Sunday average, prior-week change/unavailable state, `n/7`, provisional-until-Sunday label |
| `MVP-WGT-003` | `S19` | Latest, weekly summary, individual change, all entries, week/month/quarter/year chart with two series |
| `MVP-WGT-004` | `S19`, `S20` | Saved edit/delete triggers immediate recalculated summaries and chart |
| `MVP-BOD-001` | `S21`, `S22`, `O05` | Arbitrary `cm` type, archive/reactivate preserving identity/history |
| `MVP-BOD-002` | `S23`, `S24`, `O01` | One decimal cm/type/date, retrospective edit, future/duplicate errors, delete |
| `MVP-BOD-003` | `S21`, `S23` | Latest/date, latest and total change, entries, month/quarter/year/all chart; neutral increase/decrease semantics |
| `MVP-BOD-004` | `S23`, `S24` | Edit/delete recalculation feedback for summaries and chart |
| `MVP-UX-001` | `S01`–`S24` | `320–430` px reflow, no horizontal tables, thumb-reachable primary actions, numeric keyboards |
| `MVP-UX-002` | `S03`, `S08`–`S10`, `S14`, `O04` | Current set distinction, visible handles, saved-order feedback |
| `MVP-UX-003` | `S10`, `S12`, `S14`, `O01` | Confirmation for populated active data, current-workout discard, and historical deletion |

## Coverage audit

Expected and mapped counts by prefix: `REL 4`, `TOD 4`, `EXE 8`, `PRG 7`, `WRK 12`, `HIS 11`, `WGT 4`, `BOD 4`, `UX 3`; total `57`.
