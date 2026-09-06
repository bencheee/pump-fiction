import { notFound } from "next/navigation";

// Every route under /test-support exists only to drive an approval-gated
// browser test. ADR-0029 gives them one visibility rule: hidden unless the
// server was started with PF_ENABLE_TEST_SUPPORT=1, whatever NODE_ENV says.
// The flag is read per request, so one production build serves both the
// browser suite and an ordinary run.
const enabledValue = "1";

export function isTestSupportEnabled(): boolean {
  return process.env.PF_ENABLE_TEST_SUPPORT === enabledValue;
}

export function requireTestSupportEnabled(): void {
  if (!isTestSupportEnabled()) notFound();
}
