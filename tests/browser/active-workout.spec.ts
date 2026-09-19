import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import { fillHydrated, runScreenAction } from "./support/hydration";

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
        await fillHydrated(page.getByLabel("Name"), exercise);
        await runScreenAction(page, "Exercise actions", "Save exercise");
        await expect(page).toHaveURL(/\/exercises$/);
        await expect(page.getByText("Exercise saved.")).toBeVisible();
      }

      await page.goto("/programs/new");
      await fillHydrated(page.getByLabel("Program name"), program);
      await runScreenAction(
        page,
        "Program actions",
        /^Save (program|changes)$/,
      );
      await expect(page).toHaveURL(/\/programs$/);
      await page.getByRole("link", { name: new RegExp(program) }).click();
      await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit$/);

      for (const [split, exercise] of [
        [splitA, exerciseA],
        [splitB, exerciseB],
      ]) {
        await page.getByRole("link", { name: "Add Split" }).click();
        await page.getByLabel("Split name").fill(split);
        await page.getByRole("button", { name: "Add exercise" }).click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: exercise })
          .click();
        await runScreenAction(page, "Split actions", /^Save (split|changes)$/);
        await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit$/);
      }

      await runScreenAction(
        page,
        "Program actions",
        "Make this the current program",
      );
      await page
        .getByRole("dialog")
        .getByRole("button", { name: splitA })
        .click();
      await expect(page.getByText("Program is now current.")).toBeVisible();

      await page.goto("/today");
      await page.getByRole("button", { name: "Start today's workout" }).click();
      await expect(page).toHaveURL(/\/workout\/current$/);

      // A set is recorded by its values alone; nothing confirms it. The queue
      // opens on the first set without values.
      await expect(
        page.getByRole("heading", { name: exerciseA }),
      ).toBeVisible();
      await expect(page.getByText("Set 1 of 3")).toBeVisible();
      // With no previous performance the load wheel starts at zero, so the
      // value is turned up from there; reps start at the lowest planned count.
      await page.getByRole("button", { name: "Kilograms 5" }).click();
      await page.getByRole("button", { name: "Reps 10" }).click();
      await page.getByRole("button", { name: "Log this set" }).click();

      // The banked-set flash runs before the next set arrives.
      await expect(page.getByText("Set 2 of 3")).toBeVisible({
        timeout: 10_000,
      });

      // The overview shows the whole workout and what it has recorded.
      await page.getByRole("button", { name: "Workout overview" }).click();
      const overviewRow = page.getByRole("region", { name: exerciseA });
      await expect(overviewRow).toContainText("1 of 3 recorded");
      await testInfo.attach(`workout-overview-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // A second exercise joins this workout only.
      await page.getByRole("button", { name: "Add exercise" }).click();
      const library = page.getByRole("dialog", { name: "Add exercise" });
      await library.getByLabel("Search active library").fill(exerciseB);
      await library.getByRole("button", { name: exerciseB }).click();
      await library.getByRole("button", { name: /Add 1 selected/ }).click();
      await expect(page.getByRole("region", { name: exerciseB })).toBeVisible();
      await page
        .getByRole("button", { name: "Back to the current set" })
        .click();

      // The timer says in words that it is not counting.
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

      // Reloading restores the recorded value in place; there is no banner.
      await page.reload();
      await expect(page.getByText("Set 2 of 3")).toBeVisible();
      await page.getByRole("button", { name: `${exerciseA} set 1` }).click();
      await expect(page.getByText("Set 1 of 3")).toBeVisible();
      // The wheel sits on the recorded value, so its neighbours frame it.
      await expect(
        page.getByRole("button", { name: "Kilograms 2.5" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Kilograms 7.5" }),
      ).toBeVisible();

      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBe(geometry.clientWidth);
      await testInfo.attach(`active-workout-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      await page
        .getByRole("button", { name: "Review and finish workout" })
        .click();
      const finishReview = page.getByRole("dialog", {
        name: "Review & finish",
      });
      await expect(
        finishReview.getByText(/planned sets left without values/),
      ).toBeVisible();
      await expect(finishReview.getByText(`${exerciseA} set 2`)).toBeVisible();
      await testInfo.attach(`finish-review-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      await finishReview
        .getByRole("button", { name: "Complete workout" })
        .click();
      await expect(page).toHaveURL(/\/today$/);
      await expect(page.getByRole("heading", { name: splitB })).toBeVisible();

      await page.goto("/today/one-time");
      await fillHydrated(page.getByLabel("Workout name"), `Hotel ${stamp}`);
      await page.getByRole("button", { name: "Add Exercise" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: exerciseA })
        .click();
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Start Workout" }).click();
      await expect(page).toHaveURL(/\/workout\/current$/);
      discardedWorkoutId = await currentWorkoutId();

      await page
        .getByRole("button", { name: "Review and finish workout" })
        .click();
      const oneTimeReview = page.getByRole("dialog", {
        name: "Review & finish",
      });
      await expect(
        oneTimeReview.getByText(/planned set.*left without values/),
      ).not.toBeAttached();

      await oneTimeReview
        .getByRole("button", { name: "Discard workout" })
        .click();
      await page
        .getByRole("alertdialog", { name: "Discard this workout?" })
        .getByRole("button", { name: "Discard" })
        .click();
      await expect(page).toHaveURL(/\/today$/);
      await expect(
        page.getByRole("button", { name: "Start today's workout" }),
      ).toBeVisible();
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
