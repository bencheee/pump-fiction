import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function SplitLoading() {
  return (
    <div>
      <TopBar title="Edit Split" backHref="/programs" backLabel="Programs" />
      <PageFrame title="Split">
        <LoadingSkeleton label="Loading split" />
      </PageFrame>
    </div>
  );
}
