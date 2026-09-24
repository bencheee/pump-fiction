import { createClient } from "@supabase/supabase-js";

import { runScreenAction } from "./support/actions";
import { awaitHydration, fillHydrated } from "./support/hydration";
import { expect, test } from "./support/test";

test.describe("Today workout-start experience", () => {
  test("covers no-program, proposed, alternate, one-time, restore, and phone reflow", async ({
    page,
  }, testInfo) => {
    const seededProgramId = await clearCurrentWorkoutAndCurrentProgram();
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const exerciseA = `Press ${stamp}`;
    const exerciseB = `Pull-Up ${stamp}`;
    const program = `Strength ${stamp}`;
    const splitA = `Lower ${stamp}`;
    const splitB = `Upper ${stamp}`;

    try {
      await page.goto("/today");
      await expect(
        page.getByRole("heading", { name: "No proposed workout" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "One-time workout" }),
      ).toBeVisible();

      // Definitions save and return to their parent screen with a toast.
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
      await expect(page.getByText("Program saved.")).toBeVisible();
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
        await expect(page.getByText("Split saved.")).toBeVisible();
      }

      // Making the program current chooses the first split of its rotation.
      await runScreenAction(page, "Make current program");
      await page
        .getByRole("dialog", { name: "Choose the first split" })
        .getByRole("button", { name: splitA })
        .click();
      await expect(page.getByText("Program is now current.")).toBeVisible();

      await page.goto("/today");
      await expect(page.getByRole("heading", { name: splitA })).toBeVisible();
      await expect(page.getByText(exerciseA, { exact: true })).toBeVisible();
      // Step 3: `Another split` opens the `Choose another split` panel, and
      // Back dismisses it like every other overlay.
      const another = page.getByRole("button", { name: "Another split" });
      await awaitHydration(another);
      await another.click();
      await expect(
        page.getByRole("dialog", { name: "Choose another split" }),
      ).toBeVisible();
      await page.goBack();
      await expect(
        page.getByRole("dialog", { name: "Choose another split" }),
      ).not.toBeAttached();

      await another.click();
      await page
        .getByRole("dialog", { name: "Choose another split" })
        .getByRole("region", { name: splitB })
        .getByRole("button", { name: "Put on Today, don't start yet" })
        .click();
      await expect(page.getByText("Today-only split")).toBeVisible();
      await expect(page.getByRole("heading", { name: splitB })).toBeVisible();
      // Starts land on the overview (step 5).
      await page.getByRole("button", { name: "Start today's workout" }).click();
      await expect(page).toHaveURL(/\/workout\/current\?view=overview$/);
      await clearCurrentWorkout();

      // MVP-TOD-003 as the Owner decided after step 21: the one-time workout
      // opens the Add exercise panel on Today and starts, named `One-time
      // workout`, with what it adds. The /today/one-time form, its name
      // field, its validation and its reorder buttons are gone.
      await page.goto("/today");
      const oneTime = page.getByRole("button", { name: "One-time workout" });
      await awaitHydration(oneTime);
      await oneTime.click();
      const picker = page.getByRole("dialog", { name: "Add exercise" });
      const addSelected = picker.getByRole("button", { name: "Add selected" });
      await expect(addSelected).toBeDisabled();
      await picker
        .getByRole("searchbox", { name: "Search active library" })
        .pressSequentially(stamp);
      await picker.getByRole("button", { name: exerciseB }).click();
      await picker.getByRole("button", { name: exerciseA }).click();
      await expect(addSelected).toHaveText(/Add 2 selected/);

      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBe(geometry.clientWidth);
      await testInfo.attach(`one-time-builder-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      await addSelected.click();
      await expect(page).toHaveURL(/\/workout\/current\?view=overview$/);
      await page.goto("/today");
      const restored = page.getByRole("region", { name: "Restored workout" });
      await expect(restored).toContainText("One-time workout");
      await expect(
        restored.getByRole("link", { name: "Resume workout" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "One-time workout" }),
      ).not.toBeAttached();
      await testInfo.attach(`today-restored-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
    } finally {
      await cleanUp({
        program,
        exercises: [exerciseA, exerciseB],
        seededProgramId,
      });
    }
  });

  // The MVP-TOD-004 weight prompt on Today was withdrawn by the Owner after
  // step 21 (PLAN, Owner decision 3; ADR-0032): Body records its own
  // weigh-ins, which weight.spec.ts covers.
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

/**
 * Programs have no status since ADR-0024; the current one is a pointer in
 * app_settings. Clearing it gives Today its no-program state. The seeded
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
}) {
  const client = adminClient();
  await clearCurrentWorkout();
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
