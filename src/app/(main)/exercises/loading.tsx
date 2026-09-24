import Link from "next/link";

import { Icon, LoadingSkeleton, PageFrame } from "@/shared/ui";

import "./exercise-library.css";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. */
export default function ExercisesLoading() {
  return (
    <PageFrame
      screen="exercises"
      title="Exercises"
      titleHidden
      trailing={
        <Link
          href="/exercises/new"
          data-variant="title-add"
          aria-label="Add exercise"
          title="Add exercise"
        >
          <Icon name="plus" size={18} />
        </Link>
      }
    >
      <LoadingSkeleton label="Loading exercises" />
    </PageFrame>
  );
}
