import { LoadingSkeleton, TopBar } from "@/shared/ui";

import "./workout-detail.css";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. */
export default function HistoryWorkoutLoading() {
  return (
    <div data-workout-detail="">
      <TopBar
        screen="workout-detail"
        title="Workout"
        backHref="/history/workouts"
        backLabel="Back"
      />
      <div data-workout-detail-body="">
        <LoadingSkeleton label="Loading the saved workout" />
      </div>
    </div>
  );
}
