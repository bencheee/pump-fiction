import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function ProgramLoading() {
  return (
    <div>
      <TopBar title="Edit Program" backHref="/programs" backLabel="Programs" />
      <PageFrame title="Program">
        <LoadingSkeleton label="Loading program" />
      </PageFrame>
    </div>
  );
}
