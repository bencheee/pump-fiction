import {
  metricLabels,
  metricUnits,
  rangeStart,
  type ChartPoint,
  type ChartRange,
  type ChartSeries,
} from "./chart";

/**
 * The body-measurement rules of `weight-and-body.md`, as pure functions over
 * the stored types, their entries, and the configured local date. `T-041` keeps
 * them in the History domain beside weight and the workout statistics, and no
 * table caches a change: every value below is derived at read time, so
 * correcting one entry is immediately right everywhere.
 *
 * Nothing here calls a rise good or a fall bad. Which direction is progress
 * depends on the measurement and the person's goal, so the domain reports the
 * numbers and presentation stays neutral.
 */

export type MeasurementType = Readonly<{
  id: string;
  name: string;
  unit: "cm";
}>;

/** One stored measurement. At most one exists per type and local date. */
export type MeasurementEntry = Readonly<{
  id: string;
  entryDate: string;
  valueCm: number;
}>;

export type MeasurementEntryChange = Readonly<{
  id: string;
  entryDate: string;
  valueCm: number;
  /** Null for the first measurement, which has nothing to compare with. */
  changeCm: number | null;
}>;

/** One type as the database returns it, with everything recorded for it. */
export type StoredMeasurementType = Readonly<{
  id: string;
  name: string;
  unit: "cm";
  entries: readonly MeasurementEntry[];
}>;

/** A row of `S21`. */
export type MeasurementSummary = Readonly<{
  id: string;
  name: string;
  unit: "cm";
  /** Null while the type has no measurement; nothing invents a zero. */
  latest: MeasurementEntryChange | null;
  entryCount: number;
  /** False once a measurement exists, because the entries are its only record. */
  deletable: boolean;
}>;

/** Everything `S23` shows apart from the chart. */
export type MeasurementDetail = Readonly<{
  type: MeasurementType;
  /** Newest first, as the entry list reads. */
  entries: readonly MeasurementEntryChange[];
  latest: MeasurementEntryChange | null;
  /** `latest − first`, null until a second measurement exists. */
  totalChangeCm: number | null;
}>;

/** Every measurement newest first, each carrying its change from the one before. */
export function entryChanges(
  entries: readonly MeasurementEntry[],
): readonly MeasurementEntryChange[] {
  const ascending = [...entries].sort((left, right) =>
    left.entryDate.localeCompare(right.entryDate),
  );
  return ascending
    .map((entry, index) => ({
      id: entry.id,
      entryDate: entry.entryDate,
      valueCm: entry.valueCm,
      changeCm:
        index === 0 ? null : entry.valueCm - ascending[index - 1].valueCm,
    }))
    .reverse();
}

/** The `S21` list, ordered by name so it reads the same on every visit. */
export function measurementSummaries(
  types: readonly StoredMeasurementType[],
): readonly MeasurementSummary[] {
  return [...types]
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
    )
    .map((type) => ({
      id: type.id,
      name: type.name,
      unit: type.unit,
      latest: entryChanges(type.entries)[0] ?? null,
      entryCount: type.entries.length,
      deletable: type.entries.length === 0,
    }));
}

export function measurementDetail(
  type: StoredMeasurementType,
): MeasurementDetail {
  const entries = entryChanges(type.entries);
  const oldest = entries[entries.length - 1];
  const latest = entries[0] ?? null;
  return {
    type: { id: type.id, name: type.name, unit: type.unit },
    entries,
    latest,
    totalChangeCm:
      latest && oldest && latest.id !== oldest.id
        ? latest.valueCm - oldest.valueCm
        : null,
  };
}

/**
 * One point per measurement inside a trailing window that ends on the local
 * date. `all` is unbounded, and the series carries no direction, because
 * neither direction is progress on its own.
 */
export function measurementSeries(
  entries: readonly MeasurementEntry[],
  range: ChartRange,
  localDate: string,
): ChartSeries {
  const from = rangeStart(range, localDate);
  const points: ChartPoint[] = [...entries]
    .filter((entry) => from === null || entry.entryDate >= from)
    .sort((left, right) => left.entryDate.localeCompare(right.entryDate))
    .map((entry) => ({ date: entry.entryDate, value: entry.valueCm }));

  return {
    metric: "measurement",
    label: metricLabels.measurement,
    unit: metricUnits.measurement,
    lowerIsBetter: false,
    points,
  };
}
