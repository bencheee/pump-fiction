import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function MeasurementDetailLoading() {
  return (
    <div>
      <TopBar
        title="Measurement"
        backHref="/body/measurements"
        backLabel="Body"
      />
      <PageFrame title="Measurement">
        <LoadingSkeleton label="Loading measurement" />
      </PageFrame>
    </div>
  );
}
