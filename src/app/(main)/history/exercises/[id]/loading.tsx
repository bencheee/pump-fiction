import { LoadingSkeleton, TopBar } from "@/shared/ui";

import "./exercise-statistics-view.css";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. */
export default function ExerciseStatisticsLoading() {
  return (
    <div data-exercise-statistics="">
      <TopBar
        screen="exercise-statistics"
        title="Exercise"
        backHref="/history/exercises"
        backLabel="Back"
      />
      <div data-exercise-statistics-body="">
        <LoadingSkeleton label="Loading exercise progress" />
      </div>
    </div>
  );
}
