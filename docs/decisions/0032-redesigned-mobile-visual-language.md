# ADR-0032: The redesigned mobile visual language and the interaction it carries

- **Status:** Accepted

## Context

The Owner designed a complete new visual language for the application in a
Claude Design project and asked, on 2026-09-19, for the delivered design to be
removed and the new one carried over faithfully, with its transitions,
overlays, and date picker. The authoritative file is
`Workout App - Prototype.dc.html`; the earlier exploration files in the same
project are superseded by it.

Reading it made clear that it is not a repaint. The accent moves from purple to
green, the canvas darkens, every control becomes a pill and the radius scale
grows — but it also changes how four things work, and each of those crosses a
decision this repository already recorded.

The Owner was asked how far to follow it and answered, for both questions put
to them, that the prototype governs.

## Decision

### The prototype is the visual source of truth

`src/app/globals.css` owns the palette, radii, type scale, control sizing,
elevation, and the prototype's motion set as named keyframes. Screens compose
those tokens through `src/shared/ui`. Where the prototype animates something,
the animation is named and reusable rather than written per screen; the
`-a`/`-b` keyframe pairs exist so an animation can retrigger in place without
remounting the element that carries it.

### The active workout is a queue

A workout is worked through one set at a time. The screen shows the set it is
on, a segment per set across the whole workout, and the value on two drag
wheels; logging sends the same `update_set` command the previous set rows sent.
A separate overview holds the whole workout, reorders it, and returns to the
set in hand. An exercise handoff screen sits between exercises and a completion
screen before the workout is saved.

This replaces the accordion of exercise cards described in
[`mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md), which now
describes the queue. Nothing below the presentation changes: the command union,
delivery controller, outbox, rebase, and recovery of
[ADR-0019](0019-application-boundaries-and-active-workout-durability.md) are
untouched, and [ADR-0027](0027-a-set-is-recorded-by-its-values.md) still decides
when a set counts as recorded.

### Transient surfaces are full-viewport panels

A sheet behind a scrim becomes an opaque panel that rises over the screen. The
Radix modal semantics stay — focus containment, Escape, trigger restoration —
as does the history-backed close of the overlay stack. The destructive dialog
remains the one centred surface, with a light confirm rather than a red one.

### Screen actions are picked, then committed

Definition screens no longer carry a row of footer buttons. Their actions live
behind a `···` panel where one is selected and Continue commits it. A
destructive action still raises its dialog afterwards, so the confirmation
[ADR-0024](0024-deletion-with-preserved-history.md) requires is unchanged; what
changed is that a destructive action is never one stray tap away. This revises
the definition-form save contract in
[`mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md): a save is
still an act of leaving the screen, but it is reached through the panel.

### Body records again, on a date it is given

The design gives Body the add controls and the month-grid date picker, so
recording moves there from Today. An entry is made on any past date; a future
one is not offered.

**This reverses [ADR-0030](0030-body-is-its-own-destination.md)** on two points
it decided deliberately: that Body never creates, and that a missed day cannot
be filled in afterwards. ADR-0030 recorded that the Owner accepted that cost
with the alternative in front of them; the redesign takes the alternative. What
ADR-0030 decided about Body being the fifth destination, about its two tabs, and
about the unit no longer being a field is untouched and still governs.

Today therefore drops its weight and measurement cards and reads only the
workout aggregate. Same-day bulk measurement entry goes with the card:
measurements are recorded one at a time from their own screen, and the Server
Action that wrote a whole day at once is removed rather than left exported with
no caller. `MVP-TOD-005` no longer describes a screen that exists.

### Two smaller moves

**Set as Next** is no longer offered on Today. The design's Today panel offers
training a split today or putting it on Today; moving the rotation pointer
belongs to Programs, which is now the only place that does it.

**Reordering** is done by holding a row and dragging, as the design draws it.
The explicit up and down buttons are gone, so the arrow keys move a focused row
instead: nothing in the application should be reachable only by dragging.

## Consequences

- The charting library leaves the dependency list; see
  [ADR-0020](0020-mobile-ui-charting-and-quality-tooling.md), which now records
  the application-owned bar chart and the contract it keeps.
- Weekly weight averages no longer share the chart's axis, because a bar series
  has one. They keep their own collapsible list beside the chart.
- A weigh-in or measurement missed on its day is now recordable afterwards,
  which is the behaviour ADR-0030 refused.
- Component and browser specs describe the queue, the panels, and the actions
  panel; the assertions that named the card rows and the footer buttons are
  rewritten rather than deleted.

## Related documents

- [`../architecture/mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md)
- [`../ux/wireframe-decisions.md`](../ux/wireframe-decisions.md)
- [ADR-0020](0020-mobile-ui-charting-and-quality-tooling.md)
- [ADR-0025](0025-active-workout-in-the-main-shell.md)
- [ADR-0030](0030-body-is-its-own-destination.md)
