import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function ExerciseHistoryLoading() {
  return (
    <PageFrame title="Exercises">
      <LoadingSkeleton label="Loading exercise history" />
    </PageFrame>
  );
}
