import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

test.describe("Today workout-start experience", () => {
  test("covers no-program, proposed, alternate, one-time, restore, and phone reflow", async ({
    page,
  }, testInfo) => {
    await clearCurrentWorkoutAndActiveProgram();
    await page.goto("/today");
    await expect(page.getByText("No proposed workout")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "One-time workout" }),
    ).toBeVisible();

    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const exerciseA = `Press ${stamp}`;
    const exerciseB = `Pull-Up ${stamp}`;
    const program = `Strength ${stamp}`;
    const splitA = `Lower ${stamp}`;
    const splitB = `Upper ${stamp}`;

    for (const exercise of [exerciseA, exerciseB]) {
      await page.goto("/exercises/new");
      await page.getByLabel("Name").fill(exercise);
      await page.getByRole("button", { name: "Save Exercise" }).click();
      await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    }

    await page.goto("/programs/new");
    await page.getByLabel("Program name").fill(program);
    await page.getByRole("button", { name: "Save as Draft" }).click();
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
      await expect(page).toHaveURL(/\/splits\/[0-9a-f-]+\/edit$/);
      await page.getByRole("link", { name: program }).click();
    }

    await page.getByRole("button", { name: "Activate Program" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: splitA })
      .click();
    await expect(page.getByText("Program activated.")).toBeVisible();

    await page.goto("/today");
    await expect(page.getByText(splitA)).toBeVisible();
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
    await page.getByRole("button", { name: "Start Workout" }).click();
    await expect(
      page.getByText("Enter a name for this workout."),
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
      page.getByRole("link", { name: "Return to Workout" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "One-time workout" }),
    ).not.toBeAttached();
    await testInfo.attach(`today-restored-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await clearCurrentWorkoutAndActiveProgram();
  });
});

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function clearCurrentWorkout() {
  const { error } = await adminClient()
    .from("workouts")
    .delete()
    .in("status", ["active", "paused"]);
  if (error) throw error;
}

async function clearCurrentWorkoutAndActiveProgram() {
  await clearCurrentWorkout();
  const client = adminClient();
  const { data, error } = await client
    .from("programs")
    .select("id")
    .eq("status", "active");
  if (error) throw error;
  for (const program of data) {
    const { error: archiveError } = await client.rpc("archive_program", {
      p_program_id: program.id,
    });
    if (archiveError) throw archiveError;
  }
}
