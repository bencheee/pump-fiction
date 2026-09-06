import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function BodyHistoryLoading() {
  return (
    <PageFrame title="Body" className="pt-6">
      <LoadingSkeleton label="Loading measurements" />
    </PageFrame>
  );
}
