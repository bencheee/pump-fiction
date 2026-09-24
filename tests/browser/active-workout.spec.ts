import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

import { runScreenAction } from "./support/actions";
import { awaitHydration, fillHydrated } from "./support/hydration";
import { expect, test } from "./support/test";

test.describe("Active workout experience", () => {
  test("covers set entry, local edits, timer, restore, finish outcomes, and rotation", async ({
    page,
  }, testInfo) => {
    const seededProgramId = await clearCurrentWorkoutAndCurrentProgram();
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const exerciseA = `Squat ${stamp}`;
    const exerciseB = `Row ${stamp}`;
    const program = `Block ${stamp}`;
    const splitA = `Lower ${stamp}`;
    const splitB = `Upper ${stamp}`;
    let discardedWorkoutId: string | null = null;

    try {
      for (const exercise of [exerciseA, exerciseB]) {
        await page.goto("/exercises/new");
        await fillHydrated(page.getByLabel("Exercise name"), exercise);
        await runScreenAction(page, "Save exercise");
        await expect(page).toHaveURL(/\/exercises$/);
        await expect(page.getByText("Exercise saved.")).toBeVisible();
      }

      await page.goto("/programs/new");
      await fillHydrated(page.getByLabel("Program name"), program);
      await runScreenAction(page, "Save program");
      await expect(page).toHaveURL(/\/programs$/);
      await page.getByRole("link", { name: new RegExp(program) }).click();
      await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit$/);

      for (const [split, exercise] of [
        [splitA, exerciseA],
        [splitB, exerciseB],
      ]) {
        await page.getByRole("link", { name: "Add split" }).click();
        await fillHydrated(page.getByLabel("Split name"), split);
        await page.getByRole("button", { name: "Add exercise" }).click();
        await page
          .getByRole("dialog", { name: "Add exercise" })
          .getByRole("button", { name: exercise })
          .click();
        await runScreenAction(page, "Save split");
        await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit$/);
      }

      await runScreenAction(page, "Make current program");
      await page
        .getByRole("dialog", { name: "Choose the first split" })
        .getByRole("button", { name: splitA })
        .click();
      await expect(page.getByText("Program is now current.")).toBeVisible();

      // A start lands on the workout overview (step 5); resuming it opens the
      // set queue (step 4) on the first set still without values.
      await page.goto("/today");
      const start = page.getByRole("button", { name: "Start today's workout" });
      await awaitHydration(start);
      await start.click();
      await expect(page).toHaveURL(/\/workout\/current\?view=overview$/);
      await expect(
        page.getByRole("region", { name: `${exerciseA}, position 1 of 1` }),
      ).toContainText("3 × 8–12 · 0 of 3 recorded");
      await page.getByRole("button", { name: "Resume current set" }).click();
      const current = page.getByRole("heading", { level: 2 });
      await expect(current).toHaveText(exerciseA);
      await expect(
        page.getByText("Set 1 of 3 · 3 × 8–12 planned"),
      ).toBeVisible();

      // MVP-WRK-006: an exercise never performed says so in Last time.
      await page
        .getByRole("button", { name: "No previous performance" })
        .click();
      const last = page.getByRole("dialog", { name: "Last time" });
      await expect(
        last.getByText("No previous sets recorded for this exercise."),
      ).toBeVisible();
      await last.getByRole("button", { name: "Back to set" }).click();
      await expect(last).not.toBeAttached();

      // A set is recorded by its values alone; nothing confirms it (ADR-0027).
      // The values are entered on the wheels (step 4): a press on a candidate
      // moves the column to it.
      const segment = (position: number) =>
        page.getByRole("button", { name: `${exerciseA} set ${position}` });
      await page
        .getByRole("group", { name: "Load" })
        .getByRole("button", { name: "5", exact: true })
        .click();
      await expect(segment(1)).toHaveAttribute("data-state", "current");
      await page
        .getByRole("group", { name: "Reps" })
        .getByRole("button", { name: "10", exact: true })
        .click();
      await expect(segment(1)).toHaveAttribute("data-state", "recorded");
      await expect(page.getByText("All changes saved")).toBeAttached();

      // The next set offers the values before it, and Log this set writes
      // them and moves on to the set after (step 7).
      await segment(2).click();
      await page.getByRole("button", { name: "Log this set" }).click();
      await expect(segment(2)).toHaveAttribute("data-state", "recorded");
      await expect(
        page.getByText("Set 3 of 3 · 3 × 8–12 planned"),
      ).toBeVisible();

      // Removing a set that holds data asks; removing an empty one does not.
      await runSetAction(page, "Remove this set");
      await expect(page.getByRole("alertdialog")).toHaveCount(0);
      await expect(segment(3)).toHaveCount(0);
      await segment(2).click();
      await runSetAction(page, "Remove this set");
      await page
        .getByRole("alertdialog", { name: `Remove set 2 of ${exerciseA}?` })
        .getByRole("button", { name: "Remove" })
        .click();
      await expect(segment(2)).toHaveCount(0);

      // A set is added from the exercise's last set.
      await runSetAction(page, "Add a set to this exercise");
      await expect(page.getByText("Set added.")).toBeVisible();
      await expect(segment(2)).toHaveAttribute("data-state", "pending");

      // Today's note is saved with this occurrence only (MVP-WRK-007).
      await runSetAction(page, "Add today's note");
      const draft = page.getByRole("dialog", { name: "Today's note" });
      await fillHydrated(
        draft.getByRole("textbox", { name: "Today's note" }),
        "Felt strong",
      );
      await draft.getByRole("button", { name: "Save note" }).click();
      await expect(
        page.getByText("Note saved with this workout."),
      ).toBeVisible();
      await expect(draft).not.toBeAttached();

      // The timer pauses and resumes with a non-colour cue.
      await page
        .getByRole("button", { name: "Pause — continue later" })
        .click();
      await expect(
        page.getByText("Paused — active duration is not counting."),
      ).toBeVisible();
      await page.getByRole("button", { name: "Resume timer" }).click();
      await expect(
        page.getByText("Paused — active duration is not counting."),
      ).not.toBeAttached();

      // An exercise is added from the overview, and a focused row moves with
      // Alt and an arrow where the old screen had Move buttons (step 5).
      await page.getByRole("button", { name: "Workout overview" }).click();
      await page.getByRole("button", { name: "Add exercise" }).click();
      const librarySheet = page.getByRole("dialog", { name: "Add exercise" });
      await librarySheet
        .getByRole("searchbox", { name: "Search active library" })
        .pressSequentially(exerciseB);
      await librarySheet.getByRole("button", { name: exerciseB }).click();
      await librarySheet.getByRole("button", { name: "Add selected" }).click();
      await expect(
        page.getByText("1 exercise added to this workout."),
      ).toBeVisible();
      const row = page.getByRole("region", {
        name: `${exerciseB}, position 2 of 2`,
      });
      await expect(row).toContainText("0 of 0 recorded");
      await row.focus();
      await page.keyboard.press("Alt+ArrowUp");
      await expect(
        page.getByText(`${exerciseB} moved to position 1 of 2.`),
      ).toBeAttached();
      await expect(
        page.getByRole("region", { name: `${exerciseB}, position 1 of 2` }),
      ).toBeVisible();
      await expect(page.getByText("All changes saved")).toBeAttached();

      // Reloading restores sets, notes, order, and duration in place; the
      // restored-session banner was removed in T-023, so the values prove it.
      await page.reload();
      await expect(
        page.getByRole("region", { name: `${exerciseB}, position 1 of 2` }),
      ).toBeVisible();
      await expect(
        page.getByRole("region", { name: `${exerciseA}, position 2 of 2` }),
      ).toContainText("3 × 8–12 · 1 of 2 recorded");
      await page.getByRole("button", { name: "Resume current set" }).click();
      await expect(current).toHaveText(exerciseA);
      await segment(1).click();
      await expect(
        page.getByRole("group", { name: "Load" }).locator("[data-wheel-value]"),
      ).toHaveText(/^5kg/);
      await page.getByRole("button", { name: "Exercise note" }).click();
      const note = page.getByRole("dialog", { name: "Note" });
      await expect(note.getByText(/Today: Felt strong/)).toBeVisible();
      await note.getByRole("button", { name: "Back to set" }).click();
      await expect(note).not.toBeAttached();

      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBe(geometry.clientWidth);
      await testInfo.attach(`active-workout-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // The review names the set still without values (MVP-WRK-011).
      await page
        .getByRole("button", { name: "Review and finish workout" })
        .first()
        .click();
      const finishReview = page.getByRole("dialog", {
        name: "Review & finish",
      });
      await expect(
        finishReview.getByText(/planned set.*left without values/),
      ).toBeVisible();
      await expect(
        finishReview.getByRole("listitem").filter({
          hasText: `${exerciseA} set 2`,
        }),
      ).toBeVisible();
      await testInfo.attach(`finish-review-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // Completing saves it to History and advances the rotation.
      await finishReview
        .getByRole("button", { name: "Complete workout" })
        .click();
      await expect(page).toHaveURL(/\/today$/);
      await expect(
        page.getByText("Workout saved to History. Rotation advanced."),
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: splitB })).toBeVisible();

      // A one-time workout starts from Today's Add exercise panel (PLAN,
      // Owner decision 1 after step 21), where it used to be a named form.
      const oneTime = page.getByRole("button", { name: "One-time workout" });
      await awaitHydration(oneTime);
      await oneTime.click();
      const picker = page.getByRole("dialog", { name: "Add exercise" });
      await picker
        .getByRole("searchbox", { name: "Search active library" })
        .pressSequentially(exerciseA);
      await picker.getByRole("button", { name: exerciseA }).click();
      await picker.getByRole("button", { name: "Add selected" }).click();
      await expect(page).toHaveURL(/\/workout\/current\?view=overview$/);
      discardedWorkoutId = await currentWorkoutId();
      await expect(
        page.getByRole("region", { name: `${exerciseA}, position 1 of 1` }),
      ).toContainText("0 of 1 recorded");
      await page.getByRole("button", { name: "Resume current set" }).click();

      await page
        .getByRole("button", { name: "Review and finish workout" })
        .first()
        .click();
      const oneTimeReview = page.getByRole("dialog", {
        name: "Review & finish",
      });
      await expect(
        oneTimeReview.getByText(
          "A one-time workout has no prescription, so none of its sets can be left planned without values.",
        ),
      ).toBeVisible();
      await expect(
        oneTimeReview.getByText(/planned set.*left without values/),
      ).not.toBeAttached();

      // Discarding asks first, creates no History record and leaves the
      // rotation where it was.
      await oneTimeReview
        .getByRole("button", { name: "Discard workout" })
        .click();
      await page
        .getByRole("alertdialog", { name: "Discard this workout?" })
        .getByRole("button", { name: "Discard" })
        .click();
      await expect(page).toHaveURL(/\/today$/);
      await expect(
        page.getByText("Workout discarded. No History record created."),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Start today's workout" }),
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: splitB })).toBeVisible();
    } finally {
      await cleanUp({
        program,
        exercises: [exerciseA, exerciseB],
        seededProgramId,
        discardedWorkoutId,
      });
    }
  });
});

/*
 * The set under the finger has its own Actions panel, opened from the queue's
 * `More actions` (steps 6 and 9): pick an entry, then Continue.
 */
async function runSetAction(page: Page, entry: string) {
  await page.getByRole("button", { name: "More actions" }).click();
  const panel = page.getByRole("dialog", { name: "Actions" });
  await panel.getByRole("button", { name: entry, exact: true }).click();
  await panel.getByRole("button", { name: "Continue" }).click();
  await expect(panel).not.toBeAttached();
}

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function clearCurrentWorkout() {
  const client = adminClient();
  const { data } = await client
    .from("workouts")
    .select("id")
    .in("status", ["active", "paused"]);
  const ids = (data ?? []).map((row) => row.id as string);
  if (ids.length === 0) return;
  await client.from("active_workout_commands").delete().in("workout_id", ids);
  const { error } = await client.from("workouts").delete().in("id", ids);
  if (error) throw error;
}

async function currentWorkoutId(): Promise<string> {
  const client = adminClient();
  const { data, error } = await client
    .from("workouts")
    .select("id")
    .in("status", ["active", "paused"])
    .single();
  if (error) throw error;
  return data.id as string;
}

/**
 * Programs have no status since ADR-0024; the current one is a pointer in
 * app_settings. Clearing it gives the scenario a clean start. The seeded
 * pointer is returned so cleanup can put it back.
 */
async function clearCurrentWorkoutAndCurrentProgram(): Promise<string | null> {
  await clearCurrentWorkout();
  const client = adminClient();
  const { data, error } = await client
    .from("app_settings")
    .select("current_program_id")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  const { error: clearError } = await client
    .from("app_settings")
    .update({ current_program_id: null })
    .eq("id", 1);
  if (clearError) throw clearError;
  return (data?.current_program_id as string | null) ?? null;
}

async function cleanUp(fixture: {
  program: string;
  exercises: readonly string[];
  seededProgramId: string | null;
  discardedWorkoutId: string | null;
}) {
  const client = adminClient();
  await clearCurrentWorkout();
  if (fixture.discardedWorkoutId)
    await client
      .from("active_workout_commands")
      .delete()
      .eq("workout_id", fixture.discardedWorkoutId);
  const { data: programs } = await client
    .from("programs")
    .select("id")
    .eq("name", fixture.program);
  for (const row of programs ?? []) {
    const { data: workouts } = await client
      .from("workouts")
      .select("id")
      .eq("source_program_identity_id", row.id as string);
    const ids = (workouts ?? []).map((workout) => workout.id as string);
    if (ids.length > 0) {
      await client
        .from("active_workout_commands")
        .delete()
        .in("workout_id", ids);
      await client.from("workouts").delete().in("id", ids);
    }
  }
  await client
    .from("app_settings")
    .update({ current_program_id: null })
    .eq("id", 1);
  await client.from("programs").delete().eq("name", fixture.program);
  await client
    .from("exercises")
    .delete()
    .in("name", [...fixture.exercises]);
  if (fixture.seededProgramId)
    await client
      .from("app_settings")
      .update({ current_program_id: fixture.seededProgramId })
      .eq("id", 1);
}
