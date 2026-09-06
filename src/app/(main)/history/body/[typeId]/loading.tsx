import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function MeasurementDetailLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Measurement" backHref="/history/body" backLabel="Body" />
      <PageFrame title="Measurement" className="pt-5">
        <LoadingSkeleton label="Loading measurement" />
      </PageFrame>
    </div>
  );
}
