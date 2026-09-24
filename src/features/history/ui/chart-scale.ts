/**
 * How tall each bar of a chart stands, 0 to 100, from the values it draws.
 *
 * Every chart measures its own range first and fits its scale to it (Owner,
 * 2026-09-24): a week of weigh-ins between 90.2 and 90.8 kg is not drawn
 * against zero, where every bar would stand at the same height, but against a
 * base just under the lowest value, so the differences fill the track. The
 * base is the redesign prototype's own, from its Body chart (`bodyChart`,
 * line 2601): nine tenths of the spread under the lowest value, and never
 * less than 0.4 under it, so a spread of a tenth is not blown up into a
 * cliff. A lone value, or a range that does not move, stands full height.
 *
 * A series a smaller number wins — assistance, `MVP-HIS-010` — is measured
 * the other way up, so its best result is its tallest bar. What each bar is
 * worth is still stated in words beside the chart; the heights only draw it.
 */
export function barHeights(
  values: readonly number[],
  options: Readonly<{ lowerIsBetter?: boolean; floor?: number }> = {},
): number[] {
  if (values.length === 0) return [];
  const { lowerIsBetter = false, floor = 6 } = options;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const base = min - Math.max(0.4, (max - min) * 0.9);
  const span = Math.max(0.001, max - base);
  return values.map((value) => {
    const measured = lowerIsBetter ? max + min - value : value;
    return Math.max(floor, ((measured - base) / span) * 100);
  });
}
