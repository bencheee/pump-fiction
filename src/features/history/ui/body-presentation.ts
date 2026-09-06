/** The typographic minus the accepted design uses for a fall. */
const minus = "−";

/** A measurement reads as it was entered, to at most two decimals. */
export function formatCm(value: number): string {
  return `${trim(value)} cm`;
}

/**
 * A change is signed and read to one decimal. It carries no judgement: whether
 * a rise or a fall is progress depends on the measurement and the goal, which
 * is why nothing here colours or labels a direction.
 */
export function formatChangeCm(value: number): string {
  const sign = value < 0 ? minus : "+";
  return `${sign}${Math.abs(value).toFixed(1)} cm`;
}

/** Said once, wherever a change has nothing to compare against. */
export const noPreviousMeasurement = "First measurement";
export const noTotalChange = "Needs a second measurement";

function trim(value: number): string {
  return String(Number(value.toFixed(2)));
}
