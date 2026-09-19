import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function BodyHistoryLoading() {
  return (
    <PageFrame title="Body">
      <LoadingSkeleton label="Loading measurements" />
    </PageFrame>
  );
}
