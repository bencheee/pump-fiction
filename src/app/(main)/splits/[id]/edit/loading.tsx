import { LoadingSkeleton, TopBar } from "@/shared/ui";

import "../../../programs/split-form.css";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. The program is not known yet, so Back goes to the list. */
export default function SplitLoading() {
  return (
    <div data-split-editor="">
      <TopBar
        screen="split-editor"
        title="Edit split"
        backHref="/programs"
        backLabel="Back"
      />
      <div data-split-editor-body="">
        <LoadingSkeleton label="Loading split" />
      </div>
    </div>
  );
}
