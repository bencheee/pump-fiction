import { describe, expect, it } from "vitest";
import {
  entryChanges,
  weekEndOf,
  weekStartOf,
  weeklySummaries,
  weightOverview,
  weightSeries,
  type WeightEntry,
} from "./weight";

// 2026-08-24 and 2026-08-31 are Mondays, 2026-08-30 and 2026-09-06 Sundays.
// The current local date is a Sunday, so the same fixtures exercise both the
// provisional and the final reading of one week.
const today = "2026-09-06";

let sequence = 0;
function entry(entryDate: string, weightKg: number): WeightEntry {
  sequence += 1;
  return {
    id: `38000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    entryDate,
    weightKg,
  };
}

/** Week of 24 Aug: three of seven days. Week of 31 Aug: two, one lighter. */
function twoWeeks(): WeightEntry[] {
  return [
    entry("2026-08-24", 82),
    entry("2026-08-26", 83),
    entry("2026-08-28", 84),
    entry("2026-08-31", 82.5),
    entry("2026-09-01", 81.5),
  ];
}

describe("calendar weeks", () => {
  it("runs Monday through Sunday", () => {
    expect(weekStartOf("2026-09-06")).toBe("2026-08-31");
    expect(weekEndOf("2026-09-06")).toBe("2026-09-06");
    expect(weekStartOf("2026-08-31")).toBe("2026-08-31");
    expect(weekStartOf("2026-09-02")).toBe("2026-08-31");
  });

  it("crosses a month and a year boundary", () => {
    expect(weekStartOf("2026-09-01")).toBe("2026-08-31");
    expect(weekStartOf("2026-01-01")).toBe("2025-12-29");
    expect(weekEndOf("2025-12-31")).toBe("2026-01-04");
  });

  it("is unmoved by the local daylight-saving change", () => {
    // Europe/Zagreb springs forward on 2026-03-29 and falls back on
    // 2026-10-25, both Sundays. A local calendar date is a date, not an
    // instant, so neither week boundary shifts.
    expect(weekStartOf("2026-03-29")).toBe("2026-03-23");
    expect(weekEndOf("2026-03-23")).toBe("2026-03-29");
    expect(weekStartOf("2026-10-25")).toBe("2026-10-19");
    expect(weekEndOf("2026-10-19")).toBe("2026-10-25");
  });
});

describe("weekly summaries", () => {
  it("divides by the days recorded, not by seven", () => {
    const [current, previous] = weeklySummaries(twoWeeks(), today);
    expect(previous).toMatchObject({
      weekStart: "2026-08-24",
      weekEnd: "2026-08-30",
      averageKg: 83,
      recordedDays: 3,
    });
    expect(current).toMatchObject({
      weekStart: "2026-08-31",
      averageKg: 82,
      recordedDays: 2,
    });
  });

  it("subtracts the preceding week's average", () => {
    const [current] = weeklySummaries(twoWeeks(), today);
    expect(current.changeKg).toBe(-1);
  });

  it("leaves the change unavailable when the preceding week is empty", () => {
    // 2026-08-17 is the week between these two, and it holds nothing.
    const summaries = weeklySummaries(
      [entry("2026-08-10", 85), ...twoWeeks()],
      today,
    );
    const august24 = summaries.find((week) => week.weekStart === "2026-08-24");
    expect(august24?.changeKg).toBeNull();
    expect(august24?.changeKg).not.toBe(0);
    // The oldest week has no predecessor at all.
    expect(
      summaries.find((week) => week.weekStart === "2026-08-10")?.changeKg,
    ).toBeNull();
  });

  it("marks the current week provisional until its Sunday", () => {
    const saturday = weeklySummaries(twoWeeks(), "2026-09-05");
    expect(saturday[0]).toMatchObject({
      weekStart: "2026-08-31",
      provisional: true,
    });
    const sunday = weeklySummaries(twoWeeks(), today);
    expect(sunday[0]).toMatchObject({
      weekStart: "2026-08-31",
      provisional: false,
    });
    expect(sunday[1]).toMatchObject({
      weekStart: "2026-08-24",
      provisional: false,
    });
  });

  it("gives a week without entries no summary at all", () => {
    expect(
      weeklySummaries(twoWeeks(), today).map((week) => week.weekStart),
    ).toEqual(["2026-08-31", "2026-08-24"]);
  });
});

describe("individual weigh-ins", () => {
  it("carries the change from the previous weigh-in, newest first", () => {
    const changes = entryChanges(twoWeeks());
    expect(changes.map((change) => change.entryDate)).toEqual([
      "2026-09-01",
      "2026-08-31",
      "2026-08-28",
      "2026-08-26",
      "2026-08-24",
    ]);
    expect(changes[0].changeKg).toBe(-1);
    expect(changes[1].changeKg).toBe(-1.5);
    expect(changes.at(-1)?.changeKg).toBeNull();
  });

  it("compares by date rather than by the order it was given", () => {
    const changes = entryChanges([
      entry("2026-09-01", 81.5),
      entry("2026-08-24", 82),
    ]);
    expect(changes[0]).toMatchObject({
      entryDate: "2026-09-01",
      changeKg: -0.5,
    });
  });
});

describe("the S19 overview", () => {
  it("reports the latest weigh-in and this week", () => {
    const overview = weightOverview(twoWeeks(), today);
    expect(overview.latest).toMatchObject({
      entryDate: "2026-09-01",
      weightKg: 81.5,
      changeKg: -1,
    });
    expect(overview.currentWeek).toMatchObject({
      averageKg: 82,
      recordedDays: 2,
      changeKg: -1,
      provisional: false,
    });
  });

  it("has no current week and no latest before the first weigh-in", () => {
    const overview = weightOverview([], today);
    expect(overview.latest).toBeNull();
    expect(overview.currentWeek).toBeNull();
    expect(overview.entries).toEqual([]);
  });

  it("has no current week when this week holds nothing yet", () => {
    const overview = weightOverview([entry("2026-08-24", 82)], today);
    expect(overview.currentWeek).toBeNull();
    expect(overview.latest?.entryDate).toBe("2026-08-24");
  });
});

describe("recalculation", () => {
  it("follows an edited weigh-in through every derived value", () => {
    const before = weightOverview(twoWeeks(), today);
    const edited = twoWeeks().map((item) =>
      item.entryDate === "2026-09-01" ? entry("2026-09-01", 80.5) : item,
    );
    const after = weightOverview(edited, today);

    expect(before.currentWeek?.averageKg).toBe(82);
    expect(after.currentWeek?.averageKg).toBe(81.5);
    expect(after.currentWeek?.changeKg).toBe(-1.5);
    expect(after.latest?.weightKg).toBe(80.5);
    expect(after.latest?.changeKg).toBe(-2);
    // The untouched week is unchanged.
    expect(
      weeklySummaries(edited, today).find(
        (week) => week.weekStart === "2026-08-24",
      ),
    ).toMatchObject({ averageKg: 83, recordedDays: 3 });
  });

  it("follows a deleted weigh-in through every derived value", () => {
    const remaining = twoWeeks().filter(
      (item) => item.entryDate !== "2026-09-01",
    );
    const after = weightOverview(remaining, today);
    expect(after.currentWeek).toMatchObject({
      averageKg: 82.5,
      recordedDays: 1,
      changeKg: -0.5,
    });
    expect(after.latest).toMatchObject({
      entryDate: "2026-08-31",
      changeKg: -1.5,
    });
  });

  it("drops the week entirely when its last weigh-in goes", () => {
    const remaining = twoWeeks().filter(
      (item) => item.entryDate < "2026-08-31",
    );
    expect(weightOverview(remaining, today).currentWeek).toBeNull();
  });
});

describe("the chart series", () => {
  it("carries the daily weigh-ins with the weekly averages beside them", () => {
    const series = weightSeries(twoWeeks(), "all", today);
    expect(series.metric).toBe("weight");
    expect(series.unit).toBe("kg");
    expect(series.lowerIsBetter).toBe(false);
    expect(series.points.map((point) => point.date)).toEqual([
      "2026-08-24",
      "2026-08-26",
      "2026-08-28",
      "2026-08-31",
      "2026-09-01",
    ]);
    expect(series.companion?.metric).toBe("weekly_average");
    expect(series.companion?.points.map((point) => point.value)).toEqual([
      83, 82,
    ]);
  });

  it("gives every weekly point the span the chart labels it with", () => {
    const series = weightSeries(twoWeeks(), "all", "2026-09-05");
    expect(series.companion?.points.at(-1)).toMatchObject({
      // A provisional week is drawn at today, never in the future.
      date: "2026-09-05",
      span: {
        start: "2026-08-31",
        end: "2026-09-06",
        recordedDays: 2,
        provisional: true,
      },
    });
    expect(series.companion?.points[0]).toMatchObject({
      date: "2026-08-30",
      span: { end: "2026-08-30", provisional: false },
    });
  });

  it("trails the window back from the local date", () => {
    // `week` reaches back six days, so it starts on 2026-08-31.
    const week = weightSeries(twoWeeks(), "week", today);
    expect(week.points.map((point) => point.date)).toEqual([
      "2026-08-31",
      "2026-09-01",
    ]);
    expect(week.companion?.points.map((point) => point.span?.start)).toEqual([
      "2026-08-31",
    ]);

    // `month` reaches back to 2026-08-06 and takes both weeks.
    const month = weightSeries(twoWeeks(), "month", today);
    expect(month.points).toHaveLength(5);
    expect(month.companion?.points).toHaveLength(2);
  });

  it("keeps a week whose average began before the window", () => {
    // The window opens mid-week on a Tuesday; the week that contains it still
    // reports its whole Monday-to-Sunday average, and the span says so.
    const series = weightSeries(twoWeeks(), "week", "2026-09-01");
    expect(series.points.map((point) => point.date)).toEqual([
      "2026-08-26",
      "2026-08-28",
      "2026-08-31",
      "2026-09-01",
    ]);
    expect(series.companion?.points[0]).toMatchObject({
      value: 83,
      span: { start: "2026-08-24", recordedDays: 3 },
    });
  });

  it("is empty rather than fabricated when nothing was recorded", () => {
    const series = weightSeries([], "month", today);
    expect(series.points).toEqual([]);
    expect(series.companion?.points).toEqual([]);
  });
});
