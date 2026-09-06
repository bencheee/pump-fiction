import { redirect } from "next/navigation";

// Body opens on its Weight tab.
export default function BodyPage() {
  redirect("/body/weight");
}
