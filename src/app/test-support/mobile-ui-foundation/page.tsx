import { requireTestSupportEnabled } from "@/shared/routing/test-support-route";

import { MobileUiFoundationHarness } from "./test-harness";

// The guard reads the flag per request, so the route cannot be prerendered
// into a permanent 404 at build time. See ADR-0029.
export const dynamic = "force-dynamic";

export default function MobileUiFoundationTestSupportPage() {
  requireTestSupportEnabled();

  return <MobileUiFoundationHarness />;
}
