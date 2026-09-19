import Link from "next/link";

import { listSplitHistory } from "@/server/application/workout-history";
import { EmptyState, PageFrame } from "@/shared/ui";

import { HistoryNavigation } from "../history-navigation";

import { SplitHistoryList } from "./split-history-list";

export const dynamic = "force-dynamic";

export default async function SplitHistoryPage() {
  const result = await listSplitHistory();

  if (!result.ok) {
    return (
      <PageFrame title="History" pinned={<HistoryNavigation />}>
        <EmptyState
          icon="circle-alert"
          title="Split history couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/history/splits"
              className="mt-1 flex min-h-11 items-center rounded-full bg-[var(--pf-accent-dim)] px-5 font-semibold text-[var(--pf-accent)]"
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
