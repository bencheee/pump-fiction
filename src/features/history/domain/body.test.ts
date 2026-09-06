import { describe, expect, it } from "vitest";
import {
  entryChanges,
  measurementDetail,
  measurementSeries,
  measurementSummaries,
  type MeasurementEntry,
  type StoredMeasurementType,
} from "./body";

const today = "2026-09-06";
const waistId = "41000000-0000-4000-8000-0000000000a0";
const armId = "41000000-0000-4000-8000-0000000000b0";

let sequence = 0;
function entry(entryDate: string, valueCm: number): MeasurementEntry {
  sequence += 1;
  return {
    id: `41000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    entryDate,
    valueCm,
  };
}

function type(
  id: string,
  name: string,
  entries: readonly MeasurementEntry[],
): StoredMeasurementType {
  return { id, name, unit: "cm", entries };
}

/** Three measurements, each half a centimetre below the one before it. */
function waist(): StoredMeasurementType {
  return type(waistId, "Waist", [
    entry("2026-06-01", 85),
    entry("2026-07-01", 84.5),
    entry("2026-08-01", 84),
  ]);
}

describe("measurement entries", () => {
  it("carries the change from the preceding measurement, newest first", () => {
    const changes = entryChanges(waist().entries);
    expect(changes.map((change) => change.entryDate)).toEqual([
      "2026-08-01",
      "2026-07-01",
      "2026-06-01",
    ]);
    expect(changes[0].changeCm).toBe(-0.5);
    expect(changes.at(-1)?.changeCm).toBeNull();
  });

  it("compares by date rather than by the order it was given", () => {
    const changes = entryChanges([
      entry("2026-08-01", 84),
      entry("2026-06-01", 85),
    ]);
    expect(changes[0]).toMatchObject({ entryDate: "2026-08-01", changeCm: -1 });
  });
});

describe("the S21 list", () => {
  it("orders by name and reports the latest value and change", () => {
    const summaries = measurementSummaries([
      waist(),
      type(armId, "Left arm", [entry("2026-08-02", 36.5)]),
    ]);
    expect(summaries.map((summary) => summary.name)).toEqual([
      "Left arm",
      "Waist",
    ]);
    expect(summaries[1].latest).toMatchObject({
      valueCm: 84,
      changeCm: -0.5,
    });
    expect(summaries[0].latest?.changeCm).toBeNull();
  });

  it("shows a type without measurements as empty and deletable", () => {
    const [summary] = measurementSummaries([type(armId, "Left arm", [])]);
    expect(summary.latest).toBeNull();
    expect(summary.entryCount).toBe(0);
    expect(summary.deletable).toBe(true);
  });

  it("refuses to call a type with measurements deletable", () => {
    const [summary] = measurementSummaries([waist()]);
    expect(summary.deletable).toBe(false);
    expect(summary.entryCount).toBe(3);
  });
});

describe("the S23 detail", () => {
  it("reports the latest change and the total change", () => {
    const detail = measurementDetail(waist());
    expect(detail.latest).toMatchObject({ valueCm: 84, changeCm: -0.5 });
    expect(detail.totalChangeCm).toBe(-1);
    expect(detail.entries).toHaveLength(3);
    expect(detail.type).toEqual({ id: waistId, name: "Waist", unit: "cm" });
  });

  it("leaves both changes unavailable with a single measurement", () => {
    const detail = measurementDetail(
      type(waistId, "Waist", [entry("2026-06-01", 85)]),
    );
    expect(detail.latest?.changeCm).toBeNull();
    expect(detail.totalChangeCm).toBeNull();
    expect(detail.totalChangeCm).not.toBe(0);
  });

  it("has nothing at all before the first measurement", () => {
    const detail = measurementDetail(type(waistId, "Waist", []));
    expect(detail.latest).toBeNull();
    expect(detail.totalChangeCm).toBeNull();
    expect(detail.entries).toEqual([]);
  });

  it("separates the latest change from the total change", () => {
    // Two equal ends around a dip: the total change is zero, the latest is not.
    const detail = measurementDetail(
      type(waistId, "Waist", [
        entry("2026-06-01", 85),
        entry("2026-07-01", 83),
        entry("2026-08-01", 85),
      ]),
    );
    expect(detail.totalChangeCm).toBe(0);
    expect(detail.latest?.changeCm).toBe(2);
  });
});

describe("recalculation", () => {
  it("follows an edited measurement through both changes", () => {
    const edited = waist().entries.map((item) =>
      item.entryDate === "2026-08-01" ? entry("2026-08-01", 83) : item,
    );
    const detail = measurementDetail(type(waistId, "Waist", edited));
    expect(detail.latest?.valueCm).toBe(83);
    expect(detail.latest?.changeCm).toBe(-1.5);
    expect(detail.totalChangeCm).toBe(-2);
  });

  it("follows a deleted first measurement through the total change", () => {
    const remaining = waist().entries.filter(
      (item) => item.entryDate !== "2026-06-01",
    );
    const detail = measurementDetail(type(waistId, "Waist", remaining));
    expect(detail.totalChangeCm).toBe(-0.5);
    expect(detail.latest?.changeCm).toBe(-0.5);
  });

  it("follows a deleted latest measurement", () => {
    const remaining = waist().entries.filter(
      (item) => item.entryDate !== "2026-08-01",
    );
    const detail = measurementDetail(type(waistId, "Waist", remaining));
    expect(detail.latest).toMatchObject({
      entryDate: "2026-07-01",
      valueCm: 84.5,
    });
    expect(detail.totalChangeCm).toBe(-0.5);
  });
});

describe("the chart series", () => {
  it("carries one neutral point per measurement, oldest first", () => {
    const series = measurementSeries(waist().entries, "all", today);
    expect(series.metric).toBe("measurement");
    expect(series.unit).toBe("cm");
    expect(series.lowerIsBetter).toBe(false);
    expect(series.companion).toBeUndefined();
    expect(series.points.map((point) => point.date)).toEqual([
      "2026-06-01",
      "2026-07-01",
      "2026-08-01",
    ]);
    expect(series.points.map((point) => point.value)).toEqual([85, 84.5, 84]);
  });

  it("trails the window back from the local date", () => {
    // `quarter` reaches back to 2026-06-06, so the June measurement falls out.
    const quarter = measurementSeries(waist().entries, "quarter", today);
    expect(quarter.points.map((point) => point.date)).toEqual([
      "2026-07-01",
      "2026-08-01",
    ]);

    // `month` reaches back to 2026-08-06 and takes none of them.
    expect(measurementSeries(waist().entries, "month", today).points).toEqual(
      [],
    );

    // `year` reaches back to 2025-09-06 and takes all three.
    expect(
      measurementSeries(waist().entries, "year", today).points,
    ).toHaveLength(3);
  });

  it("is empty rather than fabricated when nothing was measured", () => {
    expect(measurementSeries([], "all", today).points).toEqual([]);
  });
});
