import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

test.describe("Active workout experience", () => {
  test("covers set entry, local edits, timer, restore, finish outcomes, and rotation", async ({
    page,
  }, testInfo) => {
    await clearCurrentWorkoutAndActiveProgram();

    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const exerciseA = `Squat ${stamp}`;
    const exerciseB = `Row ${stamp}`;
    const program = `Block ${stamp}`;
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
    await page.getByRole("button", { name: "Start Workout" }).click();
    await expect(page).toHaveURL(/\/workout\/current$/);

    const squat = page.getByRole("region", { name: exerciseA });
    await expect(
      squat.getByText("3 planned × 8–12 reps · 0 of 3 confirmed"),
    ).toBeVisible();
    await expect(
      squat.getByText("No completed performance yet."),
    ).toBeVisible();

    await squat
      .getByRole("button", { name: `Confirm set 1 of ${exerciseA}` })
      .click();
    await expect(
      page.getByText("Enter kg and reps to confirm this set.").first(),
    ).toBeVisible();

    await squat.getByLabel("kg", { exact: true }).nth(0).fill("82.5");
    await squat.getByLabel("Reps").nth(0).fill("6");
    await squat
      .getByRole("button", { name: `Confirm set 1 of ${exerciseA}` })
      .click();
    await expect(squat.getByText("Confirmed", { exact: true })).toBeVisible();
    await expect(
      squat.getByText("3 planned × 8–12 reps · 1 of 3 confirmed"),
    ).toBeVisible();
    await expect(page.getByText("All changes saved")).toBeVisible();

    await squat.getByLabel("kg", { exact: true }).nth(1).fill("80");
    await squat.getByLabel("kg", { exact: true }).nth(1).blur();
    await squat.getByText("Remove set").nth(1).click();
    await page
      .getByRole("alertdialog", { name: `Remove set 2 of ${exerciseA}?` })
      .getByRole("button", { name: "Remove Set" })
      .click();
    await expect(
      squat.getByText("3 planned × 8–12 reps · 1 of 2 confirmed"),
    ).toBeVisible();
    await squat.getByText("Remove set").nth(1).click();
    await expect(
      squat.getByText("3 planned × 8–12 reps · 1 of 1 confirmed"),
    ).toBeVisible();

    await squat.getByRole("button", { name: "Add Set" }).click();
    await expect(
      squat.getByText("3 planned × 8–12 reps · 1 of 2 confirmed"),
    ).toBeVisible();
    await expect(squat.getByText("Set 2", { exact: true })).toBeVisible();

    const noteField = squat.getByLabel(
      "Today's note · saved with this workout",
    );
    await noteField.fill("Felt strong");
    await noteField.blur();
    await expect(page.getByText("All changes saved")).toBeVisible();

    await page.getByRole("button", { name: "Add Exercise" }).click();
    const librarySheet = page.getByRole("dialog", { name: "Add Exercise" });
    await librarySheet.getByLabel("Search active library").fill(exerciseB);
    await librarySheet.getByRole("button", { name: exerciseB }).click();
    await librarySheet.getByRole("button", { name: "Add Selected" }).click();
    const row = page.getByRole("region", { name: exerciseB });
    await expect(
      row.getByText("Workout-local, no prescription · 0 of 0 confirmed"),
    ).toBeVisible();

    await page.getByRole("button", { name: `Move ${exerciseB} up` }).click();
    await expect(
      page.getByRole("button", { name: `Move ${exerciseB} up` }),
    ).toBeDisabled();

    await page.getByRole("button", { name: "Continue Later" }).click();
    await expect(
      page.getByText("Paused — active duration is not counting."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Resume" }).click();
    await expect(
      page.getByText("Paused — active duration is not counting."),
    ).not.toBeAttached();

    await page.reload();
    await expect(
      page.getByText(
        "Restored from your last session. Sets, notes, order and accumulated duration were kept.",
      ),
    ).toBeVisible();
    await expect(squat.getByLabel("kg", { exact: true }).nth(0)).toHaveValue(
      "82.5",
    );
    await expect(squat.getByText("Confirmed", { exact: true })).toBeVisible();
    await expect(noteField).toHaveValue("Felt strong");

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.scrollWidth).toBe(geometry.clientWidth);
    await testInfo.attach(`active-workout-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await page.getByRole("link", { name: "Review & Finish" }).click();
    await expect(page).toHaveURL(/\/workout\/current\/finish$/);
    await expect(
      page.getByText("Proposed split · active rotation"),
    ).toBeVisible();
    await expect(
      page.getByText("Confirmed sets", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Empty planned sets", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(`${exerciseA} set 2`)).toBeVisible();
    await expect(
      page.getByText(
        "Rotation advances to the next split, because this was the proposed split.",
      ),
    ).toBeVisible();
    await testInfo.attach(`finish-review-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await page.getByRole("button", { name: "Complete Workout" }).click();
    await expect(page).toHaveURL(/\/today$/);
    await expect(page.getByRole("heading", { name: splitB })).toBeVisible();

    await page.goto("/today/one-time");
    await page.getByLabel("Workout name").fill(`Hotel ${stamp}`);
    await page.getByRole("button", { name: "Add Exercise" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: exerciseA })
      .click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Start Workout" }).click();
    await expect(page).toHaveURL(/\/workout\/current$/);
    await expect(
      page.getByText("Workout-local, no prescription · 0 of 1 confirmed"),
    ).toBeVisible();

    await page.getByRole("link", { name: "Review & Finish" }).click();
    await expect(page.getByText("One-time workout · no split")).toBeVisible();
    await expect(
      page.getByText("Empty planned sets", { exact: true }),
    ).not.toBeAttached();
    await expect(
      page.getByText(
        "No planned-set metric: this workout has no prescription, so its set rows are workout-local rather than planned.",
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: "Discard Workout" }).click();
    await page
      .getByRole("alertdialog", { name: "Discard this workout?" })
      .getByRole("button", { name: "Discard Workout" })
      .click();
    await expect(page).toHaveURL(/\/today$/);
    await expect(
      page.getByRole("button", { name: "Start Workout" }),
    ).toBeVisible();

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
