import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function WorkoutHistoryLoading() {
  return (
    <PageFrame title="Workouts">
      <LoadingSkeleton label="Loading workout history" />
    </PageFrame>
  );
}
