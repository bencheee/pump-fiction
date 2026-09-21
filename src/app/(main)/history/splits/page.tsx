import Link from "next/link";

import { listSplitHistory } from "@/server/application/workout-history";

import { HistoryCount, HistoryPanel } from "../history-frame";
import { formatCount } from "../history-presentation";
import { SplitHistoryList } from "./split-history-list";

export const dynamic = "force-dynamic";

export default async function SplitHistoryPage() {
  const result = await listSplitHistory();

  if (!result.ok) {
    return (
      <HistoryPanel>
        <p data-history-note="">
          {result.error.message}
          <Link href="/history/splits">Try again</Link>
        </p>
      </HistoryPanel>
    );
  }

  return (
    <>
      {/* `tabCount` (line 2183) counts every split with history, not the
          ones the program filter leaves on screen. */}
      <HistoryCount>
        {formatCount(result.value.splits.length, "split")}
      </HistoryCount>
      <SplitHistoryList history={result.value} />
    </>
  );
}
