import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function SplitHistoryLoading() {
  return (
    <PageFrame title="Splits" className="pt-6">
      <LoadingSkeleton label="Loading split history" />
    </PageFrame>
  );
}
