import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

test.describe("Workout History experience", () => {
  test("covers the subsection shell, S13, S14 correction, deletion, and reflow", async ({
    page,
  }, testInfo) => {
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const fixture = await seedCompletedWorkout(stamp);

    try {
      // The History shell exposes all five subsections and lands on Workouts.
      await page.goto("/history");
      await expect(page).toHaveURL(/\/history\/workouts$/);
      const subsections = page.getByRole("navigation", {
        name: "History subsections",
      });
      for (const label of ["Workouts", "Exercises", "Splits"]) {
        await expect(
          subsections.getByRole("link", { name: label }),
        ).toBeVisible();
      }
      // Weight and Body left History for a destination of their own; ADR-0030.
      await expect(subsections.getByRole("link")).toHaveCount(3);
      await expect(
        subsections.getByRole("link", { name: "Workouts" }),
      ).toHaveAttribute("aria-current", "page");

      // S13 groups by month and summarises the saved workout.
      await expect(page.getByText("August 2026")).toBeVisible();
      const row = page
        .getByRole("link", { name: new RegExp(fixture.split) })
        .first();
      await expect(row).toBeVisible();
      await expect(row).toContainText("1 exercise");
      await testInfo.attach(`history-workouts-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // S14 renders the saved snapshot.
      await row.click();
      await expect(page).toHaveURL(/\/history\/workouts\/[0-9a-f-]+$/);
      await expect(page.getByText("60 kg × 8")).toBeVisible();
      await expect(page.getByText("No values")).toBeVisible();

      // Correcting a set value returns to the detail and shows the new value.
      await page.getByRole("link", { name: "Edit workout" }).click();
      await expect(page).toHaveURL(/\/edit$/);
      const repsFields = page.getByLabel("Reps");
      await repsFields.nth(1).fill("6");
      const kilogramFields = page.getByLabel("Kilograms");
      await kilogramFields.nth(1).fill("65");
      await expect(page.getByText("Unsaved changes")).toBeVisible();
      await page.getByRole("button", { name: "Save corrections" }).click();
      await expect(page).toHaveURL(/\/history\/workouts\/[0-9a-f-]+$/);
      await expect(page.getByText("65 kg × 6")).toBeVisible();
      await testInfo.attach(`history-workout-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // The correction changed no template and moved no rotation pointer.
      // Today prints the split name twice, in the heading and in the
      // rotation-position sentence, so match the heading.
      await page.goto("/today");
      await expect(
        page.getByRole("heading", { name: fixture.nextSplit }),
      ).toBeVisible();

      // Deleting requires confirmation and returns to the list.
      await page.goto(`/history/workouts/${fixture.workoutId}`);
      await page
        .getByRole("button", { name: "Delete workout", exact: true })
        .first()
        .click();
      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toContainText("Rotation is not affected");
      await dialog
        .getByRole("button", { name: "Delete workout", exact: true })
        .click();
      await expect(page).toHaveURL(/\/history\/workouts$/);
      await expect(
        page.getByRole("link", { name: new RegExp(fixture.split) }),
      ).toHaveCount(0);

      // The list reflows to the narrow end of the supported phone range.
      await page.setViewportSize({ width: 320, height: 720 });
      await expect(
        subsections.getByRole("link", { name: "Workouts" }),
      ).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    } finally {
      await cleanUp(fixture);
    }
  });
});

type Fixture = Readonly<{
  workoutId: string;
  exerciseId: string;
  programId: string;
  split: string;
  nextSplit: string;
}>;

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Seeds one completed August workout through the accepted operations, so the
 * browser scenario exercises the History screens rather than re-entering a
 * whole workout by hand.
 */
async function seedCompletedWorkout(stamp: string): Promise<Fixture> {
  const client = adminClient();
  await client.from("workouts").delete().in("status", ["active", "paused"]);

  const exercise = `Press ${stamp}`;
  const program = `Plan ${stamp}`;
  const split = `Push ${stamp}`;
  const nextSplit = `Pull ${stamp}`;

  const exerciseId = await rpc<string>(client, "create_exercise_definition", {
    p_name: exercise,
    p_base_type: "weights",
    p_persistent_note: "Brace hard",
    p_load_modes: ["weight"],
  });
  const programId = await rpc<string>(client, "create_program", {
    p_name: program,
  });
  const splitId = await rpc<string>(client, "create_split_definition", {
    p_program_id: programId,
    p_name: split,
    p_exercise_ids: [exerciseId],
    p_planned_sets: [2],
    p_min_reps: [8],
    p_max_reps: [12],
  });
  await rpc(client, "create_split_definition", {
    p_program_id: programId,
    p_name: nextSplit,
    p_exercise_ids: [exerciseId],
    p_planned_sets: [1],
    p_min_reps: [6],
    p_max_reps: [10],
  });
  await rpc(client, "set_current_program", {
    p_program_id: programId,
    p_next_split_id: splitId,
  });
  await rpc(client, "start_workout", {
    p_source_kind: "proposed_split",
    p_split_id: splitId,
    p_one_time_name: "",
    p_exercise_ids: [],
    p_started_at: "2026-08-10T10:00:00Z",
  });

  const { data: workout, error } = await client
    .from("workouts")
    .select("id")
    .in("status", ["active", "paused"])
    .maybeSingle();
  if (error) throw error;
  if (!workout) throw new Error("Expected the seeded workout to be current.");

  const { data: sets, error: setError } = await client
    .from("workout_sets")
    .select("id, position, workout_exercises!inner(workout_id)")
    .eq("workout_exercises.workout_id", workout.id)
    .order("position");
  if (setError) throw setError;
  const firstSet = sets?.[0];
  if (!firstSet) throw new Error("Expected snapshotted starter sets.");

  await rpc(client, "apply_active_workout_command", {
    p_command_id: randomUUID(),
    p_workout_id: workout.id,
    p_expected_revision: 0,
    p_operation: "update_set",
    p_payload: {
      workoutSetId: firstSet.id,
      loadMode: "weight",
      loadKg: 60,
      bandDirection: null,
      bandStrength: null,
      reps: 8,
    },
    p_client_created_at: "2026-08-10T10:05:00Z",
  });
  await rpc(client, "apply_active_workout_command", {
    p_command_id: randomUUID(),
    p_workout_id: workout.id,
    p_expected_revision: 1,
    p_operation: "finish_workout",
    p_payload: { outcome: "completed", finishedAt: "2026-08-10T11:00:00Z" },
    p_client_created_at: "2026-08-10T11:00:00Z",
  });

  return { workoutId: workout.id, exerciseId, programId, split, nextSplit };
}

async function cleanUp(fixture: Fixture) {
  const client = adminClient();
  await client.from("workouts").delete().eq("id", fixture.workoutId);
  await client.from("workouts").delete().in("status", ["active", "paused"]);
  await client
    .from("app_settings")
    .update({ current_program_id: null })
    .eq("id", 1);
  await client.from("programs").delete().eq("id", fixture.programId);
  await client.from("exercises").delete().eq("id", fixture.exerciseId);
}

async function rpc<T = unknown>(
  client: ReturnType<typeof adminClient>,
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data as T;
}
