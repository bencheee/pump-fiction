import { EmptyState, PageFrame } from "@/shared/ui";

export default function BodyHistoryPage() {
  return (
    <PageFrame title="Body" className="pt-6">
      <EmptyState
        title="Not built yet"
        body="Body measurements arrive with Weight and Body progress."
      />
    </PageFrame>
  );
}
