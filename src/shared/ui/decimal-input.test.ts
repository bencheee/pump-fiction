import { describe, expect, it } from "vitest";

import { normalizeDecimalInput } from "./decimal-input";

describe("normalizeDecimalInput", () => {
  it("turns a comma into a dot", () => {
    expect(Number(normalizeDecimalInput("89,2"))).toBe(89.2);
  });

  it("leaves a dot alone", () => {
    expect(Number(normalizeDecimalInput("89.2"))).toBe(89.2);
  });

  it("trims surrounding space", () => {
    expect(Number(normalizeDecimalInput("  89,2  "))).toBe(89.2);
  });

  it("accepts a whole number either way", () => {
    expect(Number(normalizeDecimalInput("89"))).toBe(89);
    expect(Number(normalizeDecimalInput("89,"))).toBe(89);
  });

  it("keeps a value with two separators unparseable", () => {
    expect(Number(normalizeDecimalInput("1,2,3"))).toBeNaN();
    expect(Number(normalizeDecimalInput("1.234,5"))).toBeNaN();
  });

  it("keeps other text unparseable", () => {
    expect(Number(normalizeDecimalInput("eighty"))).toBeNaN();
  });
});
