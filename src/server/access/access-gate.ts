// The production deployment is a private, single-user app reachable at a public
// URL, so one shared password stands between that URL and the Owner's data.
//
// This module is imported by the middleware, which runs on the Edge runtime, so
// it deliberately omits the `server-only` marker the other server modules carry
// and uses Web Crypto rather than `node:crypto`. Nothing here is importable from
// a client component; the middleware and the unlock route are its only callers.
//
// The signing key is derived from the password itself, so changing the password
// invalidates every issued cookie without a second secret to rotate.

const encoder = new TextEncoder();

// Looser than `NodeJS.ProcessEnv`, which requires `NODE_ENV`, so a test can pass
// exactly the variables it is about. The two this module reads are
// `PF_ACCESS_PASSWORD` and `VERCEL`.
type AccessEnvironment = Readonly<Record<string, string | undefined>>;

export const accessCookieName = "pf_access";

const sessionDurationMs = 180 * 24 * 60 * 60 * 1000;

export function readAccessPassword(
  environment: AccessEnvironment = process.env,
): string | undefined {
  const value = environment.PF_ACCESS_PASSWORD?.trim();
  return value ? value : undefined;
}

// Enforced whenever a password is configured, and unconditionally on Vercel so
// a deployment that lost its password variable denies every request instead of
// serving the app to anyone who has the URL. A local run without the variable
// stays open, which is what the browser suite's production server relies on.
export function isAccessGateEnforced(
  environment: AccessEnvironment = process.env,
): boolean {
  return (
    readAccessPassword(environment) !== undefined || environment.VERCEL === "1"
  );
}

export async function isAccessPasswordCorrect(
  submitted: string,
  password: string,
): Promise<boolean> {
  const [submittedDigest, expectedDigest] = await Promise.all([
    digestOf(submitted),
    digestOf(password),
  ]);

  return equalInConstantTime(submittedDigest, expectedDigest);
}

export type AccessToken = Readonly<{ value: string; expiresAt: Date }>;

export async function issueAccessToken(
  password: string,
  now: number = Date.now(),
): Promise<AccessToken> {
  const expiresAt = new Date(now + sessionDurationMs);
  const expiry = String(Math.floor(expiresAt.getTime() / 1000));

  return { value: `${expiry}.${await sign(password, expiry)}`, expiresAt };
}

export async function isAccessTokenValid(
  token: string,
  password: string,
  now: number = Date.now(),
): Promise<boolean> {
  const separator = token.indexOf(".");

  if (separator <= 0) {
    return false;
  }

  const expiry = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!/^\d+$/.test(expiry)) {
    return false;
  }

  if (!equalInConstantTime(signature, await sign(password, expiry))) {
    return false;
  }

  return Number(expiry) * 1000 > now;
}

async function sign(password: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", encoder.encode(password)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  return base64Url(
    await crypto.subtle.sign("HMAC", key, encoder.encode(payload)),
  );
}

async function digestOf(value: string): Promise<string> {
  return base64Url(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}

function base64Url(buffer: ArrayBuffer): string {
  let binary = "";

  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

// Both arguments are fixed-length digests, so the length check leaks nothing.
function equalInConstantTime(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}
