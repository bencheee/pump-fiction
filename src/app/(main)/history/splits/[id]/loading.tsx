import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function SplitStatisticsLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Split" backHref="/history/splits" backLabel="Splits" />
      <PageFrame title="Split" className="pt-5">
        <LoadingSkeleton label="Loading split progress" />
      </PageFrame>
    </div>
  );
}
