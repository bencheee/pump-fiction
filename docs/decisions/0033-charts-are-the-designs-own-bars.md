# ADR-0033: Charts are the design's own bars, drawn without a chart library

- **Status:** Accepted

## Context

[ADR-0020](0020-mobile-ui-charting-and-quality-tooling.md) chose Recharts `3.x` for the History and Body charts, drawn as lines. The Owner's prototype for the second redesign draws every chart as a card of bars: a reading of the pressed bar above, the bars themselves, the two ends of the range, a sentence under them, and a disclosed list of the values. The Owner chose those bars on 2026-09-19. Steps 11, 12, 18 and 19 of the redesign ported them to every chart in the application. The Recharts line had no screen left after step 19.

## Decision

**Every chart is one application-owned component**, the bar chart card in `src/shared/ui/bar-chart.tsx`, with CSS in `bar-chart.css`. Its `body` and `measure` variants cover Body's two charts. It is plain elements and CSS, with no chart library and no canvas or SVG drawing layer.

**The chart computes nothing about the product.** Domain services still build neutral, serializable series. The screen formats each value and gives each bar its height, through the one shared scale in `src/features/history/ui/chart-scale.ts`. That scale measures the range first and sets its base just under the lowest value, so small differences stay visible (Owner, 2026-09-24).

**A chart is never the only representation.** Every card states its values in a sentence and in a values list, or, on a measurement, in the entry list beneath it. A press on a bar moves the reading, so nothing depends on hover, and the reduced-motion rule in `globals.css` stills its entrance.

Recharts and `react-is` leave the dependencies. ADR-0020's other decisions — phone-only UI, application-owned primitives, Radix, static checks and the test tooling — are unchanged.

## Consequences

- No chart library is loaded on any route, and the client bundle loses one.
- The bar chart's look is the design's, declaration for declaration, rather than a library's theme.
- A chart the bars cannot express would need this decision revisited, not a second chart component beside this one.

## Related documents

- [ADR-0020](0020-mobile-ui-charting-and-quality-tooling.md), whose charting section this supersedes
- [`../architecture/mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md)
- [`../design/redesign-v2/PLAN.md`](../design/redesign-v2/PLAN.md), steps 11, 12, 18 and 19
