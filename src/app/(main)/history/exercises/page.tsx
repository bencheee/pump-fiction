import { EmptyState, PageFrame } from "@/shared/ui";

export default function ExercisesHistoryPage() {
  return (
    <PageFrame title="Exercises" className="pt-6">
      <EmptyState
        title="Not built yet"
        body="Exercise personal records and charts arrive with the Exercises subsection."
      />
    </PageFrame>
  );
}
