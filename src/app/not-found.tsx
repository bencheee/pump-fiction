import Link from "next/link";

import { PageFrame } from "@/shared/ui";

export default function NotFound() {
  return (
    <main className="h-dvh overflow-y-auto bg-[var(--pf-bg-canvas)]">
      <PageFrame title="Not found">
        <p className="text-[var(--pf-text-2)]">
          This page or record is unavailable.
        </p>
        <Link
          href="/today"
          className="inline-flex min-h-[52px] items-center justify-center rounded-[var(--pf-r2)] bg-[var(--pf-accent)] px-4 font-semibold text-[var(--pf-on-accent)]"
        >
          Return to Today
        </Link>
      </PageFrame>
    </main>
  );
}
