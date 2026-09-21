import { LoadingSkeleton } from "@/shared/ui";

import { HistoryPanel } from "../history-frame";

export default function SplitHistoryLoading() {
  return (
    <HistoryPanel>
      <LoadingSkeleton label="Loading split history" />
    </HistoryPanel>
  );
}
