import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

test.describe("mobile UI foundation", () => {
  test("main shell keeps five accessible destinations inside the fixed phone references", async ({
    page,
  }, testInfo) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 360, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/today");

      const navigation = page.getByRole("navigation", { name: "Primary" });
      const destinations = navigation.getByRole("link");
      await expect(destinations).toHaveCount(5);
      await expect(page.getByRole("link", { name: "Today" })).toHaveAttribute(
        "aria-current",
        "page",
      );

      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        devicePixelRatio: window.devicePixelRatio,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBe(geometry.clientWidth);
      expect(geometry.devicePixelRatio).toBe(3);

      for (const destination of await destinations.all()) {
        const box = await destination.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }

      await testInfo.attach(
        `main-shell-${testInfo.project.name}-${viewport.width}x${viewport.height}.png`,
        {
          body: await page.screenshot(),
          contentType: "image/png",
        },
      );
    }
  });

  // ADR-0025 moved the active workout into the main shell: the primary
  // navigation stays available during a workout. A current workout is seeded
  // because the route redirects to Today without one.
  test("active workout keeps primary navigation", async ({
    page,
  }, testInfo) => {
    const fixture = await seedCurrentWorkout(
      `${testInfo.project.name} ${Date.now()}`,
    );
    try {
      await page.goto("/workout/current");
      await expect(page).toHaveURL(/\/workout\/current$/);
      await expect(page.locator('[data-shell="main"]')).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Primary" }),
      ).toBeVisible();
      await expect(page.locator('[data-shell="focused"]')).toHaveCount(0);
    } finally {
      await cleanUpWorkout(fixture);
    }
  });

  test("Back dismisses the topmost sheet before its parent document", async ({
    page,
  }) => {
    await page.goto("/test-support/mobile-ui-foundation");
    await page.getByRole("button", { name: "Open sheet" }).click();
    await expect(
      page.getByRole("dialog", { name: "Choose an option" }),
    ).toBeVisible();

    await page.goBack();
    await expect(
      page.getByRole("dialog", { name: "Choose an option" }),
    ).not.toBeAttached();
    await expect(page).toHaveURL(/\/test-support\/mobile-ui-foundation$/);
  });

  test("destructive dialog starts on Cancel and restores its trigger", async ({
    page,
  }) => {
    await page.goto("/test-support/mobile-ui-foundation");
    const trigger = page.getByRole("button", {
      name: "Open destructive dialog",
    });
    await trigger.click();

    await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
});

type WorkoutFixture = Readonly<{
  exerciseId: string;
  programId: string;
  seededProgramId: string | null;
}>;

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
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

async function seedCurrentWorkout(stamp: string): Promise<WorkoutFixture> {
  const client = adminClient();
  await client.from("workouts").delete().in("status", ["active", "paused"]);
  const { data: settings } = await client
    .from("app_settings")
    .select("current_program_id")
    .eq("id", 1)
    .maybeSingle();
  const exerciseId = await rpc<string>(client, "create_exercise_definition", {
    p_name: `Shell ${stamp}`,
    p_base_type: "weights",
    p_persistent_note: "",
    p_load_modes: ["weight"],
  });
  const programId = await rpc<string>(client, "create_program", {
    p_name: `Shell plan ${stamp}`,
  });
  const splitId = await rpc<string>(client, "create_split_definition", {
    p_program_id: programId,
    p_name: `Shell split ${stamp}`,
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
    p_started_at: new Date().toISOString(),
  });
  return {
    exerciseId,
    programId,
    seededProgramId: (settings?.current_program_id as string | null) ?? null,
  };
}

async function cleanUpWorkout(fixture: WorkoutFixture) {
  const client = adminClient();
  const { data } = await client
    .from("workouts")
    .select("id")
    .in("status", ["active", "paused"]);
  const ids = (data ?? []).map((row) => row.id as string);
  if (ids.length > 0) {
    await client.from("active_workout_commands").delete().in("workout_id", ids);
    await client.from("workouts").delete().in("id", ids);
  }
  await client
    .from("app_settings")
    .update({ current_program_id: null })
    .eq("id", 1);
  await client.from("programs").delete().eq("id", fixture.programId);
  await client.from("exercises").delete().eq("id", fixture.exerciseId);
  if (fixture.seededProgramId)
    await client
      .from("app_settings")
      .update({ current_program_id: fixture.seededProgramId })
      .eq("id", 1);
}
