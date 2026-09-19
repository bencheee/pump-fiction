/**
 * Option columns for the value wheels.
 *
 * The design's wheel steps in fixed increments, but a recorded value may sit
 * off that grid — an older entry, or one typed before the redesign. The current
 * value is therefore always merged into the column, so opening a set never
 * rounds it away.
 */
function withCurrent(
  options: readonly number[],
  current: number | null,
): number[] {
  if (current === null || options.includes(current)) return [...options];
  return [...options, current].sort((left, right) => left - right);
}

const kilograms = (() => {
  const values: number[] = [];
  for (let value = 0; value <= 200; value += 2.5) values.push(value);
  return values;
})();

const repetitions = (() => {
  const values: number[] = [];
  for (let value = 1; value <= 40; value += 1) values.push(value);
  return values;
})();

const seconds = (() => {
  const values: number[] = [];
  for (let value = 5; value <= 600; value += 5) values.push(value);
  return values;
})();

export function loadOptions(current: number | null): number[] {
  return withCurrent(kilograms, current);
}

export function countOptions(
  current: number | null,
  measurement: "reps" | "seconds",
): number[] {
  return withCurrent(
    measurement === "seconds" ? seconds : repetitions,
    current,
  );
}

/** The index of `value` in `options`, or the nearest sensible starting point. */
export function optionIndex(
  options: readonly number[],
  value: number | null,
): number | undefined {
  if (value === null) return undefined;
  const found = options.indexOf(value);
  return found === -1 ? undefined : found;
}

/** Trailing zeros read as noise on a wheel, so 82.5 stays 82.5 and 80 stays 80. */
export function formatWheelNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}
