import { SubsectionNavigation } from "@/shared/ui/subsection-navigation";

// Workouts, Exercises, and Splits. Weight and Body left for a destination of
// their own in `T-052`; see ADR-0030.
const subsections = [
  { href: "/history/workouts", label: "Workouts" },
  { href: "/history/exercises", label: "Exercises" },
  { href: "/history/splits", label: "Splits" },
] as const;

export function HistoryNavigation() {
  return (
    <SubsectionNavigation
      label="History subsections"
      subsections={subsections}
    />
  );
}
