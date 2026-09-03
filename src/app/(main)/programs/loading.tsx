import { LoadingSkeleton, PageFrame } from "@/shared/ui";

export default function ProgramsLoading() {
  return (
    <PageFrame title="Programs">
      <LoadingSkeleton label="Loading programs" />
    </PageFrame>
  );
}
