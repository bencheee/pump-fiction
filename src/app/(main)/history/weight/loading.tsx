import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function WeightHistoryLoading() {
  return (
    <PageFrame title="Weight" className="pt-6">
      <LoadingSkeleton label="Loading weight history" />
    </PageFrame>
  );
}
