import { EmptyState, PageFrame } from "@/shared/ui";

export default function SplitsHistoryPage() {
  return (
    <PageFrame title="Splits" className="pt-6">
      <EmptyState
        title="Not built yet"
        body="Split duration statistics arrive with the Splits subsection."
      />
    </PageFrame>
  );
}
