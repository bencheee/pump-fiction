import { SubsectionNavigation } from "@/shared/ui/subsection-navigation";

// The two tabs of the Body destination, under ADR-0030. Body opens on Weight.
const subsections = [
  { href: "/body/weight", label: "Weight" },
  { href: "/body/measurements", label: "Measurements" },
] as const;

export function BodyNavigation() {
  return (
    <SubsectionNavigation label="Body subsections" subsections={subsections} />
  );
}
