import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

test.describe("Exercise History experience", () => {
  test("covers S15 search, S16 records, chart, and the workout link", async ({
    page,
  }, testInfo) => {
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const fixture = await seedCompletedWorkout(stamp);

    try {
      // S15 lists the exercise and filters by name.
      await page.goto("/history/exercises");
      await expect(
        page.getByRole("link", { name: new RegExp(fixture.exercise) }).first(),
      ).toBeVisible();
      await page.getByLabel("Search").fill("zzz-no-such-exercise");
      await expect(page.getByText("No matching exercise")).toBeVisible();
      await page.getByLabel("Search").fill(fixture.exercise);
      await testInfo.attach(`history-exercises-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // S16 shows the records the completed workout produced.
      await page
        .getByRole("link", { name: new RegExp(fixture.exercise) })
        .first()
        .click();
      await expect(page).toHaveURL(/\/history\/exercises\/[0-9a-f-]+$/);
      const weight = page.getByRole("region", { name: "Weight" });
      await expect(weight.getByText("Highest load")).toBeVisible();
      await expect(weight.getByText("80 kg × 3")).toBeVisible();
      await expect(page.getByText(/Highest reps in a set/)).toBeVisible();

      // The chart is never the only representation of its data.
      await expect(page.getByText(/across 1 workout/)).toBeVisible();
      await page.getByText("Chart values").click();
      // The same load also reads "80 kg" in the reps-per-load list, so the
      // assertion names the list it means.
      await expect(
        page
          .getByRole("list", { name: "Chart values" })
          .getByText("80 kg", { exact: true }),
      ).toBeVisible();

      // The metric and range selectors reload the series.
      await page.getByRole("button", { name: "Workout volume" }).click();
      await expect(page.getByText(/Workout volume across/)).toBeVisible();
      await page.getByRole("button", { name: "Week" }).click();
      await expect(
        page.getByText(/No workout falls inside this range/),
      ).toBeVisible();
      await page.getByRole("button", { name: "All" }).click();
      await expect(
        page.getByText(/Workout volume across 1 workout/),
      ).toBeVisible();
      await testInfo.attach(`history-exercise-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // Each performance links back to the workout that produced it.
      await page
        .getByRole("link", { name: new RegExp(fixture.split) })
        .first()
        .click();
      await expect(page).toHaveURL(/\/history\/workouts\/[0-9a-f-]+$/);

      // The detail reflows to the narrow end of the supported phone range.
      await page.goBack();
      await page.setViewportSize({ width: 320, height: 720 });
      await expect(page.getByText("Personal records")).toBeVisible();
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
  exercise: string;
  split: string;
}>;

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** One completed workout, seeded through the accepted operations. */
async function seedCompletedWorkout(stamp: string): Promise<Fixture> {
  const client = adminClient();
  await client.from("workouts").delete().in("status", ["active", "paused"]);

  const exercise = `Bench ${stamp}`;
  const program = `Plan ${stamp}`;
  const split = `Push ${stamp}`;

  const exerciseId = await rpc<string>(client, "create_exercise_definition", {
    p_name: exercise,
    p_base_type: "weights",
    p_persistent_note: "",
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
    p_min_reps: [3],
    p_max_reps: [12],
  });
  await rpc(client, "create_split_definition", {
    p_program_id: programId,
    p_name: `Pull ${stamp}`,
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
  const [first, second] = sets ?? [];
  if (!first || !second) throw new Error("Expected two starter sets.");

  let revision = 0;
  for (const [target, loadKg, reps] of [
    [first.id, 60, 8],
    [second.id, 80, 3],
  ] as const) {
    await rpc(client, "apply_active_workout_command", {
      p_command_id: randomUUID(),
      p_workout_id: workout.id,
      p_expected_revision: revision,
      p_operation: "update_set",
      p_payload: {
        workoutSetId: target,
        loadMode: "weight",
        loadKg,
        bandDirection: null,
        bandStrength: null,
        reps,
      },
      p_client_created_at: "2026-08-10T10:05:00Z",
    });
    revision += 1;
  }
  await rpc(client, "apply_active_workout_command", {
    p_command_id: randomUUID(),
    p_workout_id: workout.id,
    p_expected_revision: revision,
    p_operation: "finish_workout",
    p_payload: { outcome: "completed", finishedAt: "2026-08-10T11:00:00Z" },
    p_client_created_at: "2026-08-10T11:00:00Z",
  });

  return { workoutId: workout.id, exerciseId, programId, exercise, split };
}

async function cleanUp(fixture: Fixture) {
  const client = adminClient();
  await client
    .from("active_workout_commands")
    .delete()
    .eq("workout_id", fixture.workoutId);
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
