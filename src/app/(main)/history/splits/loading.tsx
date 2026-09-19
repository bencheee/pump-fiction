import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function SplitHistoryLoading() {
  return (
    <PageFrame title="Splits">
      <LoadingSkeleton label="Loading split history" />
    </PageFrame>
  );
}
