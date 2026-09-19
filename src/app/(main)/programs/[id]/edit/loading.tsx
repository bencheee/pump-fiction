import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function ProgramLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Edit Program" backHref="/programs" backLabel="Programs" />
      <PageFrame title="Program" className="pt-5">
        <LoadingSkeleton label="Loading program" />
      </PageFrame>
    </div>
  );
}
