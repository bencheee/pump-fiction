import { LoadingSkeleton, TabbedPanel } from "@/shared/ui";

/* Inside Body's tabbed frame, as the tab's own panel: the frame already draws
   the tab bar. */
export default function WeightHistoryLoading() {
  return (
    <TabbedPanel>
      <LoadingSkeleton label="Loading weight history" />
    </TabbedPanel>
  );
}
