import { LoadingSkeleton, TopBar } from "@/shared/ui";

import "../../program-form.css";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. */
export default function ProgramLoading() {
  return (
    <div data-program="">
      <TopBar
        screen="program"
        title="Edit program"
        backHref="/programs"
        backLabel="Back"
      />
      <div data-program-body="">
        <LoadingSkeleton label="Loading program" />
      </div>
    </div>
  );
}
