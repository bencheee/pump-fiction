import { afterEach, describe, expect, it } from "vitest";

import { isTestSupportEnabled } from "./test-support-route";

const original = process.env.PF_ENABLE_TEST_SUPPORT;

afterEach(() => {
  if (original === undefined) delete process.env.PF_ENABLE_TEST_SUPPORT;
  else process.env.PF_ENABLE_TEST_SUPPORT = original;
});

describe("test-support visibility", () => {
  it("is off when the flag is absent", () => {
    delete process.env.PF_ENABLE_TEST_SUPPORT;
    expect(isTestSupportEnabled()).toBe(false);
  });

  it("is on only for the exact opt-in value", () => {
    process.env.PF_ENABLE_TEST_SUPPORT = "1";
    expect(isTestSupportEnabled()).toBe(true);

    // A truthy-looking value is not the opt-in. ADR-0029 makes the rule one
    // explicit flag, so "true", "0", and an empty string all keep it hidden.
    for (const value of ["true", "0", "", "yes"]) {
      process.env.PF_ENABLE_TEST_SUPPORT = value;
      expect(isTestSupportEnabled()).toBe(false);
    }
  });
});
