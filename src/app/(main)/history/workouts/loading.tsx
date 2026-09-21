import { LoadingSkeleton } from "@/shared/ui";

import { HistoryPanel } from "../history-frame";

export default function WorkoutHistoryLoading() {
  return (
    <HistoryPanel>
      <LoadingSkeleton label="Loading workout history" />
    </HistoryPanel>
  );
}
