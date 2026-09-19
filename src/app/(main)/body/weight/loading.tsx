import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function WeightHistoryLoading() {
  return (
    <PageFrame title="Weight">
      <LoadingSkeleton label="Loading weight history" />
    </PageFrame>
  );
}
