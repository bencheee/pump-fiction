import { redirect } from "next/navigation";

/*
 * The review is a panel over the active workout since step 6 of
 * docs/design/redesign-v2/PLAN.md — the prototype's screen 30, opened from
 * `openFinish` (line 3484) without leaving the workout — and
 * `docs/product/workouts.md` already called it "an in-place sheet from the
 * current client workout snapshot".
 *
 * The URL stays as the recovery and deep-link path
 * `docs/architecture/mobile-ui-foundation.md` describes, and hands over to the
 * one screen that draws the review.
 */
export default function FinishWorkoutPage() {
  redirect("/workout/current?panel=finish");
}
