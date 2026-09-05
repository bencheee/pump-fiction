import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function ExerciseHistoryLoading() {
  return (
    <PageFrame title="Exercises" className="pt-6">
      <LoadingSkeleton label="Loading exercise history" />
    </PageFrame>
  );
}
