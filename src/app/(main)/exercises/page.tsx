import Link from "next/link";

import { listExercises } from "@/server/application/exercises";
import { Icon, PageFrame } from "@/shared/ui";

import { ExerciseLibrary } from "./exercise-library";
import "./exercise-library.css";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const result = await listExercises();

  if (!result.ok) {
    // A read that failed, which the prototype has no notion of: the note card
    // every ported list answers such a state with.
    return (
      <PageFrame
        screen="exercises"
        title="Exercises"
        trailing={<AddExercise />}
      >
        <p data-note-card="">
          {result.error.message}
          <Link href="/exercises">Try again</Link>
        </p>
      </PageFrame>
    );
  }

  return <ExerciseLibrary exercises={result.value} add={<AddExercise />} />;
}

/** `dfAdd` (line 902): a new definition opens as its own screen, a route here. */
function AddExercise() {
  return (
    <Link
      href="/exercises/new"
      data-variant="title-add"
      aria-label="Add exercise"
      title="Add exercise"
    >
      <Icon name="plus" size={18} />
    </Link>
  );
}
