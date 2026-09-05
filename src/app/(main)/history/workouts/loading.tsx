import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function WorkoutHistoryLoading() {
  return (
    <PageFrame title="Workouts" className="pt-6">
      <LoadingSkeleton label="Loading workout history" />
    </PageFrame>
  );
}
