import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

test.describe("Split History experience", () => {
  test("covers S17 filtering, S18 durations, chart, and the workout link", async ({
    page,
  }, testInfo) => {
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const fixture = await seedCompletedSplitWorkout(stamp);

    try {
      // S17 lists the split under its program with its aggregates.
      await page.goto("/history/splits");
      const row = page
        .getByRole("link", { name: new RegExp(fixture.split) })
        .first();
      await expect(row).toBeVisible();
      await expect(row).toContainText("1 workout");
      await expect(row).toContainText("avg 1 h");
      await testInfo.attach(`history-splits-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // S18 shows the six duration statistics and the exclusion rule.
      await row.click();
      await expect(page).toHaveURL(/\/history\/splits\/[0-9a-f-]+$/);
      for (const label of [
        "Completed",
        "Average",
        "Shortest",
        "Longest",
        "Latest",
        "Total",
      ])
        await expect(page.getByText(label, { exact: true })).toBeVisible();
      await expect(
        page.getByText(/One-time workouts and workouts saved as incomplete/),
      ).toBeVisible();

      // The chart is never the only representation of its data.
      await expect(
        page.getByText(/Active duration across 1 workout/),
      ).toBeVisible();
      await page.getByText("Chart values").click();
      await expect(
        page.getByRole("list", { name: "Chart values" }).getByText("1 h"),
      ).toBeVisible();

      // The range selector reloads the series; the workout is older than a week.
      await page.getByRole("button", { name: "Week" }).click();
      await expect(
        page.getByText(/No workout falls inside this range/),
      ).toBeVisible();
      await page.getByRole("button", { name: "All" }).click();
      await expect(
        page.getByText(/Active duration across 1 workout/),
      ).toBeVisible();
      await testInfo.attach(`history-split-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // Each workout links back to its detail.
      await page
        .getByRole("list", { name: "Split workouts" })
        .getByRole("link")
        .first()
        .click();
      await expect(page).toHaveURL(/\/history\/workouts\/[0-9a-f-]+$/);

      // The detail reflows to the narrow end of the supported phone range.
      await page.goBack();
      await page.setViewportSize({ width: 320, height: 720 });
      await expect(page.getByText("Duration", { exact: true })).toBeVisible();
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
}>;

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** One completed one-hour split workout, seeded through the accepted operations. */
async function seedCompletedSplitWorkout(stamp: string): Promise<Fixture> {
  const client = adminClient();
  await client.from("workouts").delete().in("status", ["active", "paused"]);

  const exercise = `Press ${stamp}`;
  const split = `Legs ${stamp}`;
  const exerciseId = await rpc<string>(client, "create_exercise_definition", {
    p_name: exercise,
    p_base_type: "weights",
    p_persistent_note: "",
    p_load_modes: ["weight"],
  });
  const programId = await rpc<string>(client, "create_program", {
    p_name: `Plan ${stamp}`,
  });
  const splitId = await rpc<string>(client, "create_split_definition", {
    p_program_id: programId,
    p_name: split,
    p_exercise_ids: [exerciseId],
    p_planned_sets: [1],
    p_min_reps: [5],
    p_max_reps: [8],
  });
  await rpc(client, "create_split_definition", {
    p_program_id: programId,
    p_name: `Arms ${stamp}`,
    p_exercise_ids: [exerciseId],
    p_planned_sets: [1],
    p_min_reps: [5],
    p_max_reps: [8],
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
  await rpc(client, "apply_active_workout_command", {
    p_command_id: randomUUID(),
    p_workout_id: workout.id,
    p_expected_revision: 0,
    p_operation: "finish_workout",
    p_payload: { outcome: "completed", finishedAt: "2026-08-10T11:00:00Z" },
    p_client_created_at: "2026-08-10T11:00:00Z",
  });
  return { workoutId: workout.id, exerciseId, programId, split };
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
