import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function ExercisesLoading() {
  return (
    <PageFrame title="Exercises">
      <LoadingSkeleton label="Loading exercises" />
    </PageFrame>
  );
}
