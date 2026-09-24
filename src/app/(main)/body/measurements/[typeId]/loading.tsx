import { LoadingSkeleton, TopBar } from "@/shared/ui";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. */
export default function MeasurementDetailLoading() {
  return (
    <div data-measurement="">
      <TopBar
        screen="measurement"
        title="Measurement"
        backHref="/body/measurements"
        backLabel="Back"
      />
      <div data-measurement-body="">
        <LoadingSkeleton label="Loading measurement" />
      </div>
    </div>
  );
}
