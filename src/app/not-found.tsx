import Link from "next/link";

import { PageFrame } from "@/shared/ui";

export default function NotFound() {
  return (
    <main>
      <PageFrame title="Not found">
        <p>This page or record is unavailable.</p>
        <Link href="/today">Return to Today</Link>
      </PageFrame>
    </main>
  );
}
