import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function ExerciseStatisticsLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title="Exercise"
        backHref="/history/exercises"
        backLabel="Exercises"
      />
      <PageFrame title="Exercise" className="pt-5">
        <LoadingSkeleton label="Loading exercise progress" />
      </PageFrame>
    </div>
  );
}
