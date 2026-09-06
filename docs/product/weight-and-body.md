# Weight and body progress

## Shared date rules

Weight and measurement entries use the user's configured local time zone. Retrospective entry and editing are allowed; future dates are not. Historical changes immediately affect derived values and charts.

## Weight tracker

There is at most one weight entry per local calendar date. An entry contains date and decimal kilograms. Today is the default date; entries can be edited or deleted.

The Today destination offers today's entry only when none exists. The full Weight experience lives under History.

### Weekly calculation

A week runs Monday through Sunday in the configured local time zone.

`weekly average = sum of existing daily entries / number of entries`

`weekly change = current weekly average − previous weekly average`

Seven entries are not required. The UI always shows measured days, such as `5/7`. If the previous week has no data, weekly change is unavailable rather than displayed as zero.

The current week's result is provisional until Sunday; on Sunday it is shown as final. A historical edit recalculates every affected week.

Weeks are local calendar dates rather than instants, so the twice-yearly local clock change never moves a week boundary. A week with no entry has no average, no change, and no row: nothing fabricates a zero for it.

Weeks are local calendar dates rather than instants, so the twice-yearly local clock change never moves a week boundary. A week with no entry has no average, no change, and no row: nothing fabricates a zero for it.

Weeks are local calendar dates rather than instants, so the twice-yearly local clock change never moves a week boundary. A week with no entry has no average, no change, and no row: nothing fabricates a zero for it.

### Weight view

Show latest weight, current weekly average, change from the previous week, recorded-days count, chart, all weigh-ins, and the change from the previous individual weigh-in.

The previous individual weigh-in is the one before it *by date*, not by the order the entries were typed, so a retrospective entry inserted between two others changes the change of the one that follows it.

Values are stored and shown as entered, to two decimals. Averages and changes are rounded to one decimal for display only; the derivation and the stored value keep their full precision.

The chart supports week, month, quarter, and year and displays daily values together with weekly averages. It opens on the month.

Its range is a trailing window that ends on the local date, as every History chart's is, while weekly averages stay Monday-to-Sunday calendar weeks. The two do not line up, and that is deliberate: `week` shows the last seven days, and the weekly average beside them is still the week's. A weekly point is drawn on the last day its week actually reaches, so the current provisional week appears at today rather than in the future, and it carries the week it covers, its recorded-days count, and whether it is still provisional. A week that began before the window keeps its whole average, because a week is a week.

## Body tracker

The user defines arbitrary measurement types. A type has a name and a unit fixed to `cm`; there is no archived state. A type that still has entries cannot be deleted, because those entries are the only record of that measurement. Each type permits at most one entry per local calendar date; an entry stores date and a decimal value in centimeters.

Entries can be retrospective, edited, or deleted, but cannot be future-dated.

Archiving a measurement type preserves all history and permits later reactivation.

### Measurement detail

Show latest value and date, change from the preceding measurement, total change from the first measurement, chart, and history.

`latest change = latest value − previous value`

`total change = latest value − first value`

The app does not label increase or decrease as inherently positive, because that depends on the measurement and user's goal.

The chart supports month, quarter, year, and all.
