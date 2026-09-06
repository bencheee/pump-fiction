import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

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

    try {
      for (const exercise of [exerciseA, exerciseB]) {
        await page.goto("/exercises/new");
        await page.getByLabel("Name").fill(exercise);
        await page.getByRole("button", { name: "Save Exercise" }).click();
        await expect(page).toHaveURL(/\/exercises$/);
        await expect(page.getByText("Exercise saved.")).toBeVisible();
      }

      await page.goto("/programs/new");
      await page.getByLabel("Program name").fill(program);
      await page.getByRole("button", { name: "Save Program" }).click();
      await expect(page).toHaveURL(/\/programs$/);
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
      }

      await page.getByRole("button", { name: "Make Current Program" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: splitA })
        .click();
      await expect(page.getByText("Program is now current.")).toBeVisible();

      await page.goto("/today");
      await page.getByRole("button", { name: "Start Workout" }).click();
      await expect(page).toHaveURL(/\/workout\/current$/);

      // A set is recorded by its values alone; nothing confirms it.
      const squat = page.getByRole("region", { name: exerciseA });
      await expect(
        squat.getByText("3 planned × 8–12 reps · 0 of 3 recorded"),
      ).toBeVisible();
      await expect(
        squat.getByText("No completed performance yet."),
      ).toBeVisible();

      await squat.getByLabel("kg", { exact: true }).nth(0).fill("82.5");
      await squat.getByLabel("Reps").nth(0).fill("6");
      await squat.getByLabel("Reps").nth(0).blur();
      await expect(
        squat.getByText("3 planned × 8–12 reps · 1 of 3 recorded"),
      ).toBeVisible();
      await expect(page.getByText("All changes saved")).toBeVisible();

      // Removing a set that holds data asks; removing an empty one does not.
      await squat.getByLabel("kg", { exact: true }).nth(1).fill("80");
      await squat.getByLabel("kg", { exact: true }).nth(1).blur();
      await squat.getByText("Remove set").nth(1).click();
      await page
        .getByRole("alertdialog", { name: `Remove set 2 of ${exerciseA}?` })
        .getByRole("button", { name: "Remove Set" })
        .click();
      await expect(
        squat.getByText("3 planned × 8–12 reps · 1 of 2 recorded"),
      ).toBeVisible();
      await squat.getByText("Remove set").nth(1).click();
      await expect(
        squat.getByText("3 planned × 8–12 reps · 1 of 1 recorded"),
      ).toBeVisible();

      await squat.getByRole("button", { name: "Add Set" }).click();
      await expect(
        squat.getByText("3 planned × 8–12 reps · 1 of 2 recorded"),
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
        row.getByText("Workout-local, no prescription · 0 of 0 recorded"),
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

      // Reloading restores sets, notes, order, and duration in place; the
      // restored-session banner was removed in T-023, so the values prove it.
      await page.reload();
      await expect(squat.getByLabel("kg", { exact: true }).nth(0)).toHaveValue(
        "82.5",
      );
      await expect(
        squat.getByText("3 planned × 8–12 reps · 1 of 2 recorded"),
      ).toBeVisible();
      await expect(noteField).toHaveValue("Felt strong");
      await expect(
        page.getByRole("button", { name: `Move ${exerciseB} up` }),
      ).toBeDisabled();

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
        page.getByText("Recorded sets", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Sets left without values", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText(`${exerciseA} set 2`)).toBeVisible();
      await expect(
        page.getByText(/Rotation advances to the next split/),
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
        page.getByText("Workout-local, no prescription · 0 of 1 recorded"),
      ).toBeVisible();

      await page.getByRole("link", { name: "Review & Finish" }).click();
      await expect(page.getByText("One-time workout · no split")).toBeVisible();
      await expect(
        page.getByText("Sets left without values", { exact: true }),
      ).not.toBeAttached();
      await expect(page.getByText(/No planned-set metric/)).toBeVisible();

      await page.getByRole("button", { name: "Discard Workout" }).click();
      await page
        .getByRole("alertdialog", { name: "Discard this workout?" })
        .getByRole("button", { name: "Discard Workout" })
        .click();
      await expect(page).toHaveURL(/\/today$/);
      await expect(
        page.getByRole("button", { name: "Start Workout" }),
      ).toBeVisible();
    } finally {
      await cleanUp({
        program,
        exercises: [exerciseA, exerciseB],
        seededProgramId,
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
