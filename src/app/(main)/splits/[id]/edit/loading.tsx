import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function SplitLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Edit Split" backHref="/programs" backLabel="Programs" />
      <PageFrame title="Split" className="pt-5">
        <LoadingSkeleton label="Loading split" />
      </PageFrame>
    </div>
  );
}
