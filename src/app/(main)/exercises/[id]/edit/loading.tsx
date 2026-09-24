import { LoadingSkeleton, TopBar } from "@/shared/ui";

import "../../exercise-form.css";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. */
export default function ExerciseLoading() {
  return (
    <div data-definition="">
      <TopBar
        screen="definition"
        title="Edit exercise"
        backHref="/exercises"
        backLabel="Back"
      />
      <div data-definition-body="">
        <LoadingSkeleton label="Loading exercise" />
      </div>
    </div>
  );
}
