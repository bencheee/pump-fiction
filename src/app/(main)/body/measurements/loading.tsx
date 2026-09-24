import { LoadingSkeleton, TabbedPanel } from "@/shared/ui";

/* Inside Body's tabbed frame, as the tab's own panel: the frame already draws
   the tab bar. */
export default function BodyHistoryLoading() {
  return (
    <TabbedPanel>
      <LoadingSkeleton label="Loading measurements" />
    </TabbedPanel>
  );
}
