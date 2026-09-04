import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function TodayLoading() {
  return (
    <PageFrame title="Today">
      <LoadingSkeleton label="Loading Today" />
    </PageFrame>
  );
}
