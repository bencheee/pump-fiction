import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import { awaitHydration, fillHydrated } from "./support/hydration";

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
      await expect(page.getByText("No proposed workout")).toBeVisible();
      await expect(
        page.getByRole("link", { name: "One-time workout" }),
      ).toBeVisible();

      // Definitions save and return to their parent screen with a toast.
      for (const exercise of [exerciseA, exerciseB]) {
        await page.goto("/exercises/new");
        await fillHydrated(page.getByLabel("Name"), exercise);
        await page.getByRole("button", { name: "Save Exercise" }).click();
        await expect(page).toHaveURL(/\/exercises$/);
        await expect(page.getByText("Exercise saved.")).toBeVisible();
      }

      await page.goto("/programs/new");
      await fillHydrated(page.getByLabel("Program name"), program);
      await page.getByRole("button", { name: "Save Program" }).click();
      await expect(page).toHaveURL(/\/programs$/);
      await expect(page.getByText("Program saved.")).toBeVisible();
      await page.getByRole("link", { name: new RegExp(program) }).click();
      await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit$/);

      for (const [split, exercise] of [
        [splitA, exerciseA],
        [splitB, exerciseB],
      ]) {
        await page.getByRole("link", { name: "Add Split" }).click();
        await page.getByLabel("Split name").fill(split);
        await page.getByRole("button", { name: "Add Exercise" }).click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: exercise })
          .click();
        await page.getByRole("button", { name: "Save Split" }).click();
        await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit$/);
        await expect(page.getByText("Split saved.")).toBeVisible();
      }

      // Making the program current chooses the first split of its rotation.
      await page.getByRole("button", { name: "Make Current Program" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: splitA })
        .click();
      await expect(page.getByText("Program is now current.")).toBeVisible();

      await page.goto("/today");
      await expect(page.getByRole("heading", { name: splitA })).toBeVisible();
      await page.getByRole("button", { name: "Choose another split" }).click();
      await expect(
        page.getByRole("dialog", { name: "Choose Another Split" }),
      ).toBeVisible();
      await page.goBack();
      await expect(
        page.getByRole("dialog", { name: "Choose Another Split" }),
      ).not.toBeAttached();

      await page.getByRole("button", { name: "Choose another split" }).click();
      const splitCard = page
        .getByRole("dialog")
        .locator("section")
        .filter({ hasText: splitB });
      await splitCard
        .getByRole("button", { name: "Put on Today, don't start yet" })
        .click();
      await expect(page.getByText("Today-only split")).toBeVisible();
      await page.getByRole("button", { name: "Start Workout" }).click();
      await expect(page).toHaveURL(/\/workout\/current$/);
      await clearCurrentWorkout();

      await page.goto("/today/one-time");
      const startButton = page.getByRole("button", { name: "Start Workout" });
      await awaitHydration(startButton);
      await startButton.click();
      await expect(
        page.getByText("Enter a name for this workout.").first(),
      ).toBeVisible();
      await page.getByLabel("Workout name").fill(`Hotel ${stamp}`);
      await page.getByRole("button", { name: "Add Exercise" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: exerciseA })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: exerciseB })
        .click();
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: `Move ${exerciseB} up` }).click();

      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBe(geometry.clientWidth);
      await testInfo.attach(`one-time-builder-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      await page.getByRole("button", { name: "Start Workout" }).click();
      await expect(page).toHaveURL(/\/workout\/current$/);
      await page.goto("/today");
      await expect(page.getByLabel("Restored workout")).toContainText(
        `Hotel ${stamp}`,
      );
      await expect(
        page.getByRole("link", { name: "Resume Workout" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "One-time workout" }),
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

  test("covers the MVP-TOD-004 weight prompt, its sheet, and Weight", async ({
    page,
  }, testInfo) => {
    // The prompt is about the local date, so this scenario writes today's
    // weigh-in and deletes exactly the row it created. It never removes one it
    // found: if today already had a weigh-in the card would show that value and
    // this test would fail rather than destroy it.
    let createdToday = false;

    try {
      await page.goto("/today");
      const card = page.getByRole("region", { name: "Today's weight" });
      await expect(card).toBeVisible();
      const add = card.getByRole("button", { name: "Add today's weight" });
      await expect(add).toBeVisible();

      // S04 is a sheet fixed to today, dismissible like every other overlay.
      await add.click();
      const sheet = page.getByRole("dialog", { name: "Add today's weight" });
      await expect(sheet).toBeVisible();
      await testInfo.attach(`today-weight-sheet-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();

      await add.click();
      await fillHydrated(sheet.getByLabel("Weight (kg)"), "82.4");
      await sheet.getByRole("button", { name: "Save Weight" }).click();
      createdToday = true;

      // The prompt is gone for the day and the recorded value stands in its
      // place, with no second create path.
      await expect(sheet).toBeHidden();
      await expect(card.getByText("82.4 kg")).toBeVisible();
      await expect(
        card.getByRole("button", { name: "Add today's weight" }),
      ).toHaveCount(0);
      await testInfo.attach(`today-weight-saved-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // The same weigh-in is what Weight shows, and correcting it lives there.
      await card.getByRole("link", { name: "See Weight" }).click();
      await expect(page).toHaveURL(/\/body\/weight$/);
      await expect(
        page.getByRole("list", { name: "Weigh-ins" }).getByRole("link").first(),
      ).toContainText("82.4 kg");

      // Reloading Today keeps the recorded state; the prompt never returns.
      await page.goto("/today");
      await expect(
        page
          .getByRole("region", { name: "Today's weight" })
          .getByText("82.4 kg"),
      ).toBeVisible();
    } finally {
      if (createdToday) await removeTodaysWeighIn();
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

/** Removes only the weigh-in this suite created, on the configured local date. */
async function removeTodaysWeighIn() {
  const client = adminClient();
  const { data, error: readError } = await client.rpc("get_weight_overview");
  if (readError) throw readError;
  const localDate = (data as { localDate: string }).localDate;
  const { error } = await client
    .from("weight_entries")
    .delete()
    .eq("entry_date", localDate);
  if (error) throw error;
}
