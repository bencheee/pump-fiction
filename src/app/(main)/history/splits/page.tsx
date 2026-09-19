import Link from "next/link";

import { listSplitHistory } from "@/server/application/workout-history";
import { EmptyState, PageFrame } from "@/shared/ui";

import { SplitHistoryList } from "./split-history-list";

export const dynamic = "force-dynamic";

export default async function SplitHistoryPage() {
  const result = await listSplitHistory();

  if (!result.ok) {
    return (
      <PageFrame title="Splits">
        <EmptyState
          title="Split history couldn't be loaded"
          body={result.error.message}
          action={<Link href="/history/splits">Retry</Link>}
        />
      </PageFrame>
    );
  }

  return <SplitHistoryList history={result.value} />;
}
