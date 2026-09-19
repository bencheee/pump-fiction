import Link from "next/link";

import { listSplitHistory } from "@/server/application/workout-history";
import { EmptyState, PageFrame } from "@/shared/ui";

import { SplitHistoryList } from "./split-history-list";

export const dynamic = "force-dynamic";

export default async function SplitHistoryPage() {
  const result = await listSplitHistory();

  if (!result.ok) {
    return (
      <PageFrame title="Splits" className="pt-6">
        <EmptyState
          title="Split history couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/history/splits"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  return <SplitHistoryList history={result.value} />;
}
