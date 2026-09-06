import { describe, expect, it } from "vitest";
import {
  maxTypeNameLength,
  maxValueCm,
  validateMeasurementEntry,
  validateMeasurementEntryEdit,
  validateMeasurementId,
  validateMeasurementTypeName,
  validateMeasurementTypeRename,
} from "./body-validation";

const today = "2026-09-06";
const typeId = "41000000-0000-4000-8000-0000000000a0";
const entryId = "41000000-0000-4000-8000-0000000000a1";

describe("measurement type validation", () => {
  it("trims the name and refuses a blank one", () => {
    expect(validateMeasurementTypeName({ name: "  Waist  " })).toEqual({
      ok: true,
      value: { name: "Waist" },
    });
    for (const name of ["", "   ", 5, null, undefined]) {
      expect(validateMeasurementTypeName({ name }).ok).toBe(false);
    }
  });

  it("refuses a name longer than the column expects", () => {
    expect(
      validateMeasurementTypeName({ name: "x".repeat(maxTypeNameLength) }).ok,
    ).toBe(true);
    expect(
      validateMeasurementTypeName({ name: "x".repeat(maxTypeNameLength + 1) })
        .ok,
    ).toBe(false);
  });

  it("requires a saved type to rename", () => {
    expect(
      validateMeasurementTypeRename({ id: typeId, name: "Waist at navel" }),
    ).toEqual({ ok: true, value: { id: typeId, name: "Waist at navel" } });
    expect(validateMeasurementTypeRename({ name: "Waist" }).ok).toBe(false);
    expect(validateMeasurementTypeRename({ id: typeId, name: "  " }).ok).toBe(
      false,
    );
  });

  it("requires a saved identifier to delete", () => {
    expect(validateMeasurementId(typeId)).toEqual({ ok: true, value: typeId });
    expect(validateMeasurementId("nope").ok).toBe(false);
  });
});

describe("measurement entry validation", () => {
  const draft = { measurementTypeId: typeId, entryDate: today, valueCm: 84.2 };

  it("accepts today and any earlier date", () => {
    expect(validateMeasurementEntry(draft, today)).toEqual({
      ok: true,
      value: draft,
    });
    expect(
      validateMeasurementEntry({ ...draft, entryDate: "2025-01-31" }, today).ok,
    ).toBe(true);
  });

  it("refuses a future or unreal date on the date field", () => {
    for (const entryDate of ["2026-09-07", "2026-02-30", "nope"]) {
      const result = validateMeasurementEntry({ ...draft, entryDate }, today);
      expect(result.ok).toBe(false);
      expect(result.ok ? {} : result.fieldErrors).toHaveProperty("entryDate");
    }
  });

  it("refuses a value that is not above zero", () => {
    for (const valueCm of [0, -1, Number.NaN, "84", null]) {
      const result = validateMeasurementEntry({ ...draft, valueCm }, today);
      expect(result.ok).toBe(false);
      expect(result.ok ? {} : result.fieldErrors).toHaveProperty("valueCm");
    }
  });

  it("accepts two decimals and refuses three", () => {
    expect(
      validateMeasurementEntry({ ...draft, valueCm: 84.2 }, today).ok,
    ).toBe(true);
    expect(
      validateMeasurementEntry({ ...draft, valueCm: 84.25 }, today).ok,
    ).toBe(true);
    expect(
      validateMeasurementEntry({ ...draft, valueCm: 84.256 }, today).ok,
    ).toBe(false);
  });

  it("refuses a value the column cannot hold", () => {
    expect(
      validateMeasurementEntry({ ...draft, valueCm: maxValueCm }, today).ok,
    ).toBe(true);
    expect(
      validateMeasurementEntry({ ...draft, valueCm: 100000 }, today).ok,
    ).toBe(false);
  });

  it("requires the measurement it belongs to", () => {
    const result = validateMeasurementEntry(
      { entryDate: today, valueCm: 84.2 },
      today,
    );
    expect(result.ok).toBe(false);
    expect(result.ok ? {} : result.fieldErrors).toHaveProperty(
      "measurementTypeId",
    );
  });

  it("applies every value rule to a correction, which names the entry", () => {
    expect(
      validateMeasurementEntryEdit(
        { id: entryId, entryDate: today, valueCm: 84.2 },
        today,
      ),
    ).toEqual({
      ok: true,
      value: { id: entryId, entryDate: today, valueCm: 84.2 },
    });
    expect(
      validateMeasurementEntryEdit({ entryDate: today, valueCm: 84.2 }, today)
        .ok,
    ).toBe(false);
    expect(
      validateMeasurementEntryEdit(
        { id: entryId, entryDate: "2026-09-07", valueCm: 84.2 },
        today,
      ).ok,
    ).toBe(false);
  });
});
