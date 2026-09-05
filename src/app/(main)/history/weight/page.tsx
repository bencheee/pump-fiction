import { EmptyState, PageFrame } from "@/shared/ui";

export default function WeightHistoryPage() {
  return (
    <PageFrame title="Weight" className="pt-6">
      <EmptyState
        title="Not built yet"
        body="Weight tracking arrives with Weight and Body progress."
      />
    </PageFrame>
  );
}
