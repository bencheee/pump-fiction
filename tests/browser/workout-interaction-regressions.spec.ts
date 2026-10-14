import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import {
  rememberCurrentProgram,
  restoreCurrentProgram,
} from "./support/current-program";
import { runScreenAction } from "./support/actions";
import { awaitHydration } from "./support/hydration";
import { expect, test } from "./support/test";

test("chooses an alternate and confirms logging separately", async ({
  page,
}, testInfo) => {
  const url = process.env.SUPABASE_URL!;
  if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(url))
    throw new Error("Local database required");
  const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const previousProgram = await rememberCurrentProgram();
  const tag = randomUUID();
  let programId: string | undefined;
  let exerciseId: string | undefined;
  async function rpc<T>(
    name: string,
    args: Record<string, unknown>,
  ): Promise<T> {
    const { data, error } = await db.rpc(name, args);
    if (error) throw error;
    return data as T;
  }
  try {
    const { data: active, error } = await db
      .from("workouts")
      .select("id")
      .in("status", ["active", "paused"]);
    if (error) throw error;
    expect(active, "fixture must not replace an existing workout").toHaveLength(
      0,
    );
    exerciseId = await rpc<string>("create_exercise_definition", {
      p_name: `Press ${tag}`,
      p_base_type: "weights",
      p_weight_increment: 2,
      p_persistent_note: "",
      p_load_modes: ["weight"],
    });
    programId = await rpc<string>("create_program", {
      p_name: `Regression ${tag}`,
    });
    await page.goto(`/exercises/${exerciseId}/edit`);
    const increment = page.getByRole("spinbutton", {
      name: "Weight increment (kg)",
    });
    await awaitHydration(increment);
    await expect(increment).toHaveValue("2");
    await increment.fill("5");
    await runScreenAction(page, "Save exercise");
    await expect(page).toHaveURL(/\/exercises$/);
    const { data: updated, error: updateError } = await db
      .from("exercises")
      .select("weight_increment")
      .eq("id", exerciseId)
      .single();
    if (updateError) throw updateError;
    expect(updated.weight_increment).toBe(5);
    await page.goto(`/exercises/${exerciseId}/edit`);
    await awaitHydration(increment);
    await increment.fill("2");
    await runScreenAction(page, "Save exercise");
    await expect(page).toHaveURL(/\/exercises$/);
    const splitIds: string[] = [];
    for (const name of ["Upper B", "Upper A"]) {
      splitIds.push(
        await rpc<string>("create_split_definition", {
          p_program_id: programId,
          p_name: name,
          p_exercise_ids: [exerciseId],
          p_planned_sets: [3],
          p_min_reps: [8],
          p_max_reps: [12],
        }),
      );
    }
    await rpc("set_current_program", {
      p_program_id: programId,
      p_next_split_id: splitIds[0],
    });
    await page.goto("/today");
    const another = page.getByRole("button", { name: "Another split" });
    await awaitHydration(another);
    await another.click();
    await page
      .getByRole("region", { name: "Upper A" })
      .getByRole("button", { name: "Train this today" })
      .click();
    await expect(page).toHaveURL(`/workout/preview?split=${splitIds[1]}`);
    await page.goBack();
    await expect(page).toHaveURL(/\/today$/);
    await expect(
      page.getByRole("dialog", { name: "Choose another split" }),
    ).not.toBeAttached();
    await another.click();
    await page
      .getByRole("region", { name: "Upper A" })
      .getByRole("button", { name: "Train this today" })
      .click();
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
    await expect(page).toHaveURL(/\/workout\/current$/);
    await page
      .getByRole("group", { name: "Load" })
      .getByRole("button", { name: "4", exact: true })
      .click();
    await page
      .getByRole("group", { name: "Load" })
      .getByRole("button", { name: "6", exact: true })
      .click();
    await page
      .getByRole("group", { name: "Reps" })
      .getByRole("button", { name: "10", exact: true })
      .click();
    const segment = page.getByRole("button", { name: `Press ${tag} set 2` });
    await segment.click();
    await page.getByRole("button", { name: "Log this set" }).click();
    await expect(segment).toHaveAttribute("data-state", "current");
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      const confirm = page.getByRole("button", { name: "Confirm log set" });
      await confirm.scrollIntoViewIfNeeded();
      const box = await confirm.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(48);
      expect(box!.width).toBeGreaterThan(100);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      await page.screenshot({
        path: `test-results/confirm-${testInfo.project.name}-${width}.png`,
      });
    }
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(segment).toHaveAttribute("data-state", "current");
    await page.getByRole("button", { name: "Log this set" }).click();
    await page.getByRole("button", { name: "Confirm log set" }).click();
    await expect(segment).toHaveAttribute("data-state", "recorded");
    await expect(page.getByText("Set 3 of 3 · 3 × 8–12 planned")).toBeVisible();
    await expect(page.getByText("All changes saved")).toBeAttached();
    const { data: sets, error: setsError } = await db
      .from("workout_sets")
      .select(
        "reps,load_kg,workout_exercises!inner(workouts!inner(source_program_id))",
      )
      .eq("position", 2)
      .eq("workout_exercises.workouts.source_program_id", programId);
    if (setsError) throw setsError;
    expect(sets).toHaveLength(1);
    expect(sets![0]).toMatchObject({ reps: 10, load_kg: 6 });
  } finally {
    if (programId) {
      const { data: workouts, error } = await db
        .from("workouts")
        .select("id")
        .eq("source_program_id", programId);
      if (error) throw error;
      for (const workout of workouts ?? []) {
        const { error: commandError } = await db
          .from("active_workout_commands")
          .delete()
          .eq("workout_id", workout.id);
        if (commandError) throw commandError;
      }
      const { error: deleteError } = await db
        .from("workouts")
        .delete()
        .eq("source_program_id", programId);
      if (deleteError) throw deleteError;
      await rpc("delete_program", { p_program_id: programId });
    }
    if (exerciseId) await rpc("delete_exercise", { p_exercise_id: exerciseId });
    await restoreCurrentProgram(previousProgram);
  }
});
