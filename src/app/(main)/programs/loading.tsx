import Link from "next/link";

import { Icon, LoadingSkeleton, PageFrame } from "@/shared/ui";

import "./programs.css";

/* The frame the screen itself opens with, so the bar does not move when the
   read arrives. The prototype has no loading state and the skeleton inside is
   still unported. */
export default function ProgramsLoading() {
  return (
    <PageFrame
      screen="programs"
      title="Programs"
      titleHidden
      trailing={
        <Link
          href="/programs/new"
          data-variant="title-add"
          aria-label="Add program"
          title="Add program"
        >
          <Icon name="plus" size={18} />
        </Link>
      }
    >
      <LoadingSkeleton label="Loading programs" />
    </PageFrame>
  );
}
