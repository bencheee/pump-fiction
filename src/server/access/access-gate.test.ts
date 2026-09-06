import { describe, expect, it } from "vitest";

import {
  isAccessGateEnforced,
  isAccessPasswordCorrect,
  isAccessTokenValid,
  issueAccessToken,
  readAccessPassword,
} from "./access-gate";

const password = "a-long-private-passphrase";

describe("readAccessPassword", () => {
  it("returns the trimmed password", () => {
    expect(readAccessPassword({ PF_ACCESS_PASSWORD: "  secret  " })).toBe(
      "secret",
    );
  });

  it("treats a blank password as absent", () => {
    expect(readAccessPassword({ PF_ACCESS_PASSWORD: "   " })).toBeUndefined();
    expect(readAccessPassword({})).toBeUndefined();
  });
});

describe("isAccessGateEnforced", () => {
  it("is enforced when a password is configured", () => {
    expect(isAccessGateEnforced({ PF_ACCESS_PASSWORD: password })).toBe(true);
  });

  it("is enforced on Vercel even without a password", () => {
    expect(isAccessGateEnforced({ VERCEL: "1" })).toBe(true);
  });

  it("stays open locally when no password is configured", () => {
    expect(isAccessGateEnforced({})).toBe(false);
  });
});

describe("isAccessPasswordCorrect", () => {
  it("accepts the configured password", async () => {
    await expect(isAccessPasswordCorrect(password, password)).resolves.toBe(
      true,
    );
  });

  it("rejects any other value", async () => {
    await expect(isAccessPasswordCorrect("", password)).resolves.toBe(false);
    await expect(
      isAccessPasswordCorrect(`${password}x`, password),
    ).resolves.toBe(false);
  });
});

describe("access tokens", () => {
  it("accepts a token it just issued", async () => {
    const token = await issueAccessToken(password);

    await expect(isAccessTokenValid(token.value, password)).resolves.toBe(true);
  });

  it("rejects a token signed with a different password", async () => {
    const token = await issueAccessToken(password);

    await expect(isAccessTokenValid(token.value, "other")).resolves.toBe(false);
  });

  it("rejects a token whose expiry was edited", async () => {
    const token = await issueAccessToken(password);
    const forged = `${Math.floor(Date.now() / 1000) + 999}.${token.value.split(".")[1]}`;

    await expect(isAccessTokenValid(forged, password)).resolves.toBe(false);
  });

  it("rejects a token after its expiry", async () => {
    const token = await issueAccessToken(password);

    await expect(
      isAccessTokenValid(
        token.value,
        password,
        token.expiresAt.getTime() + 1000,
      ),
    ).resolves.toBe(false);
  });

  it("rejects malformed values", async () => {
    for (const value of ["", ".", "abc", ".signature", "12x3.signature"]) {
      await expect(isAccessTokenValid(value, password)).resolves.toBe(false);
    }
  });
});
