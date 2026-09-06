import { describe, expect, it } from "vitest";
import {
  maxWeightKg,
  validateWeightEntry,
  validateWeightEntryEdit,
  validateWeightEntryId,
} from "./weight-validation";

const today = "2026-09-06";
const id = "38000000-0000-4000-8000-000000000001";

function fieldsOf(result: ReturnType<typeof validateWeightEntry>) {
  return result.ok ? {} : result.fieldErrors;
}

describe("weight entry validation", () => {
  it("accepts today and any earlier date", () => {
    expect(
      validateWeightEntry({ entryDate: today, weightKg: 82.4 }, today),
    ).toEqual({ ok: true, value: { entryDate: today, weightKg: 82.4 } });
    expect(
      validateWeightEntry({ entryDate: "2025-01-31", weightKg: 90 }, today).ok,
    ).toBe(true);
  });

  it("refuses a future date on the date field", () => {
    const result = validateWeightEntry(
      { entryDate: "2026-09-07", weightKg: 82 },
      today,
    );
    expect(result.ok).toBe(false);
    expect(fieldsOf(result)).toHaveProperty("entryDate");
  });

  it("refuses a date that is not a real calendar date", () => {
    for (const entryDate of [
      "2026-02-30",
      "not-a-date",
      "2026-9-6",
      20260906,
    ]) {
      expect(validateWeightEntry({ entryDate, weightKg: 82 }, today).ok).toBe(
        false,
      );
    }
  });

  it("refuses a weight that is not above zero", () => {
    for (const weightKg of [0, -1, Number.NaN, "82", null]) {
      const result = validateWeightEntry({ entryDate: today, weightKg }, today);
      expect(result.ok).toBe(false);
      expect(fieldsOf(result)).toHaveProperty("weightKg");
    }
  });

  it("accepts two decimals and refuses three", () => {
    // 82.4 * 100 is 8240.000000000001 in binary floating point, so a naive
    // scale check would reject a perfectly ordinary weight.
    expect(
      validateWeightEntry({ entryDate: today, weightKg: 82.4 }, today).ok,
    ).toBe(true);
    expect(
      validateWeightEntry({ entryDate: today, weightKg: 82.45 }, today).ok,
    ).toBe(true);
    expect(
      validateWeightEntry({ entryDate: today, weightKg: 82.456 }, today).ok,
    ).toBe(false);
  });

  it("refuses a weight the column cannot hold", () => {
    expect(
      validateWeightEntry({ entryDate: today, weightKg: maxWeightKg }, today)
        .ok,
    ).toBe(true);
    expect(
      validateWeightEntry({ entryDate: today, weightKg: 10000 }, today).ok,
    ).toBe(false);
  });

  it("refuses anything that is not an entry at all", () => {
    for (const input of [null, undefined, "82", [], 5]) {
      expect(validateWeightEntry(input, today).ok).toBe(false);
    }
  });
});

describe("edit and delete validation", () => {
  it("requires a saved weigh-in to correct", () => {
    expect(
      validateWeightEntryEdit({ id, entryDate: today, weightKg: 82 }, today),
    ).toEqual({ ok: true, value: { id, entryDate: today, weightKg: 82 } });
    expect(
      validateWeightEntryEdit({ entryDate: today, weightKg: 82 }, today).ok,
    ).toBe(false);
    expect(
      validateWeightEntryEdit(
        { id: "nope", entryDate: today, weightKg: 82 },
        today,
      ).ok,
    ).toBe(false);
  });

  it("still applies every value rule to a correction", () => {
    const result = validateWeightEntryEdit(
      { id, entryDate: "2026-09-07", weightKg: 82 },
      today,
    );
    expect(result.ok).toBe(false);
    expect(result.ok ? {} : result.fieldErrors).toHaveProperty("entryDate");
  });

  it("requires a saved weigh-in to delete", () => {
    expect(validateWeightEntryId(id)).toEqual({ ok: true, value: id });
    expect(validateWeightEntryId("nope").ok).toBe(false);
    expect(validateWeightEntryId(null).ok).toBe(false);
  });
});
