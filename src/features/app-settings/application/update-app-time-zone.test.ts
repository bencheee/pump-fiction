import { describe, expect, it, vi } from "vitest";

import type { AppSettingsRepository } from "./app-settings-repository";
import { RepositoryError } from "./app-settings-repository";
import { updateAppTimeZone } from "./update-app-time-zone";

const settings = {
  timeZone: "Europe/Zagreb",
  weightUnit: "kg" as const,
  measurementUnit: "cm" as const,
};

describe("updateAppTimeZone", () => {
  it("rejects an invalid time zone before calling the repository", async () => {
    const repository = createRepository();

    const result = await updateAppTimeZone(repository, {
      timeZone: "not/a-zone",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "validation",
        message: "Check the submitted values and try again.",
        retryable: false,
        fieldErrors: { timeZone: ["Enter a valid IANA time zone."] },
      },
    });
    expect(repository.updateTimeZone).not.toHaveBeenCalled();
  });

  it("returns a domain-shaped result for a valid update", async () => {
    const repository = createRepository();

    const result = await updateAppTimeZone(repository, {
      timeZone: " Europe/Zagreb ",
    });

    expect(repository.updateTimeZone).toHaveBeenCalledWith("Europe/Zagreb");
    expect(result).toEqual({ ok: true, value: settings });
  });

  it("maps infrastructure failures to the generic retry contract", async () => {
    const repository = createRepository();
    vi.mocked(repository.updateTimeZone).mockRejectedValue(
      new RepositoryError("unavailable"),
    );

    const result = await updateAppTimeZone(repository, {
      timeZone: "Europe/Zagreb",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "persistence",
        message: "We couldn't save the changes. Try again.",
        retryable: true,
      },
    });
  });
});

function createRepository(): AppSettingsRepository {
  return {
    get: vi.fn().mockResolvedValue(settings),
    updateTimeZone: vi.fn().mockResolvedValue(settings),
  };
}
