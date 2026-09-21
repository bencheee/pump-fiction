import { LoadingSkeleton } from "@/shared/ui";

import { HistoryPanel } from "../history-frame";

export default function ExerciseHistoryLoading() {
  return (
    <HistoryPanel>
      <LoadingSkeleton label="Loading exercise history" />
    </HistoryPanel>
  );
}
