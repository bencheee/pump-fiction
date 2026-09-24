import { LoadingSkeleton, TopBar } from "@/shared/ui";

import "./split-statistics-view.css";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. */
export default function SplitStatisticsLoading() {
  return (
    <div data-split-statistics="">
      <TopBar
        screen="split-statistics"
        title="Split"
        backHref="/history/splits"
        backLabel="Back"
      />
      <div data-split-statistics-body="">
        <LoadingSkeleton label="Loading split progress" />
      </div>
    </div>
  );
}
