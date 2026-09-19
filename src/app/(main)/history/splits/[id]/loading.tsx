import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function SplitStatisticsLoading() {
  return (
    <div>
      <TopBar title="Split" backHref="/history/splits" backLabel="Splits" />
      <PageFrame title="Split">
        <LoadingSkeleton label="Loading split progress" />
      </PageFrame>
    </div>
  );
}
