import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import { fillHydrated } from "./support/hydration";

// F-010 owns MVP-REL-003 and MVP-REL-004, the two criteria no single Feature
// could prove: each one is about what happens *between* the Features. Every
// earlier scenario checked its own screens against its own data, so nothing
// yet loads one dataset that touches every persisted category at once, nor
// edits a definition and then reads a saved workout that already contains it.
//
// The fixtures sit in a fixed past month this spec owns end to end and are
// removed again, and nothing touches today, which may hold a real weigh-in.
const month = { from: "2026-05-01", to: "2026-05-31" };
const completedAt = "2026-05-12";
const incompleteAt = "2026-05-14";
const weighIns = ["2026-05-08", "2026-05-11"] as const;
const measuredAt = ["2026-05-08", "2026-05-15"] as const;

test.describe("Local MVP integration", () => {
  test("preserves every persisted category across a reload and a reopen", async ({
    page,
    browser,
  }, testInfo) => {
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const fixture = await seed(stamp);

    try {
      // Every category MVP-REL-003 names is read once here, so a later
      // reload and reopen can be compared against a known starting state.
      await expectEverythingPresent(page, fixture);
      await testInfo.attach(
        `release-persistence-${testInfo.project.name}.png`,
        {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        },
      );

      // Reloading preserves it.
      await page.reload();
      await expectEverythingPresent(page, fixture);

      // Reopening preserves it too, which is the stronger half of the
      // criterion: a fresh context carries no localStorage, no IndexedDB, and
      // no session, so anything that survives here is genuinely persisted
      // rather than remembered by this browser.
      // A context made from the raw browser inherits nothing from the project,
      // so the phone profile and the base URL are passed in deliberately.
      const reopened = await browser.newContext({
        baseURL: testInfo.project.use.baseURL,
        viewport: page.viewportSize() ?? undefined,
        userAgent: testInfo.project.use.userAgent,
        deviceScaleFactor: testInfo.project.use.deviceScaleFactor,
        isMobile: testInfo.project.use.isMobile,
        hasTouch: testInfo.project.use.hasTouch,
      });
      try {
        const fresh = await reopened.newPage();
        await expectEverythingPresent(fresh, fixture);

        // The active workout comes back with its entered set, its note, and
        // its accumulated duration rather than restarting.
        // The seed started it 25 minutes ago, so a timer that restarted from
        // zero rather than resuming would read under a minute.
        await fresh.goto("/workout/current");
        await expect(
          fresh.getByLabel("kg", { exact: true }).first(),
        ).toHaveValue("60");
        await expect(fresh.getByLabel("Reps").first()).toHaveValue("8");
        await expect(
          fresh.getByLabel("Today's note · saved with this workout"),
        ).toHaveValue(fixture.workoutNote);
        await expect(fresh.getByLabel("Active duration")).toHaveText(
          /^(2[5-9]|[3-9]\d):\d{2}$/,
        );
      } finally {
        await reopened.close();
      }
    } finally {
      await cleanUp(fixture);
    }
  });

  test("never reinterprets saved data when a definition or a workout changes", async ({
    page,
  }, testInfo) => {
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const fixture = await seed(stamp);
    const client = adminClient();

    try {
      // The saved workout as it stands, before anything upstream moves.
      await page.goto(`/history/workouts/${fixture.completedWorkoutId}`);
      await expect(page.getByText(fixture.pressName)).toBeVisible();
      await expect(page.getByText(fixture.pressNote)).toBeVisible();
      await expect(page.getByText("60 kg × 8")).toBeVisible();

      // Rename the definition, replace its note, and widen its load modes.
      const renamed = `Renamed ${stamp}`;
      await rpc(client, "update_exercise_definition", {
        p_exercise_id: fixture.pressId,
        p_name: renamed,
        p_base_type: "weights",
        p_persistent_note: "A different note entirely",
        p_load_modes: ["weight", "weight_resistance_band"],
      });

      // The saved workout keeps the name and the note it snapshotted. This is
      // the half of MVP-REL-004 that only a cross-Feature scenario can reach:
      // F-005 owns the edit and F-008 owns the snapshot that must not move.
      await page.reload();
      await expect(page.getByText(fixture.pressName)).toBeVisible();
      await expect(page.getByText(fixture.pressNote)).toBeVisible();
      await expect(page.getByText(renamed)).toHaveCount(0);
      await expect(page.getByText("A different note entirely")).toHaveCount(0);

      // Deleting a definition that history already contains removes it from
      // the library and from future selection, and changes no saved workout.
      await rpc(client, "delete_exercise", { p_exercise_id: fixture.chinId });

      await page.goto("/exercises");
      await expect(page.getByText(fixture.chinName)).toHaveCount(0);

      await page.goto(`/history/workouts/${fixture.completedWorkoutId}`);
      await expect(page.getByText(fixture.chinName)).toBeVisible();
      await expect(page.getByText("× 12")).toBeVisible();
      await expect(page.getByText("No longer in the library")).toBeVisible();

      // Exercise History keeps the deleted definition by its identity
      // snapshot, so its performances remain reachable.
      await page.goto("/history/exercises");
      await expect(
        page.getByRole("link", { name: new RegExp(fixture.chinName) }).first(),
      ).toBeVisible();

      // Deleting a split leaves the workouts it produced with their name
      // snapshot and moves only the rotation successor.
      await rpc(client, "delete_split", { p_split_id: fixture.pushSplitId });

      // The saved workout prints its split name in the top bar, the page
      // heading, and the summary list, so the snapshot is read from the
      // summary entry rather than from all three at once.
      await page.goto(`/history/workouts/${fixture.completedWorkoutId}`);
      await expect(
        page.getByRole("definition").filter({ hasText: fixture.pushSplit }),
      ).toBeVisible();
      await page.goto("/history/splits");
      await expect(
        page.getByRole("link", { name: new RegExp(fixture.pushSplit) }).first(),
      ).toBeVisible();

      // A historical correction recalculates the derived output and moves no
      // template: the split still prescribes what it always did.
      // The first entry after a full navigation waits for hydration: WebKit
      // otherwise types into a controlled field before React attaches to it,
      // which is the race T-037 recorded.
      await page.goto(`/history/workouts/${fixture.completedWorkoutId}/edit`);
      await fillHydrated(page.getByLabel("Kilograms").first(), "95");
      await page.getByRole("button", { name: "Save corrections" }).click();
      await expect(page).toHaveURL(/\/history\/workouts\/[0-9a-f-]+$/);
      await expect(page.getByText("95 kg × 8")).toBeVisible();

      await page.goto("/history/exercises");
      await page
        .getByRole("link", { name: new RegExp(fixture.pressName) })
        .first()
        .click();
      await expect(
        page
          .getByRole("region", { name: "Weight" })
          .getByText("95 kg × 8")
          .first(),
      ).toBeVisible();
      await testInfo.attach(
        `release-reinterpretation-${testInfo.project.name}.png`,
        {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        },
      );

      // The template the workout came from never moved with it.
      const { data: prescription, error } = await client
        .from("split_exercises")
        .select("planned_sets, min_reps, max_reps")
        .eq("split_id", fixture.pullSplitId)
        .single();
      if (error) throw error;
      expect(prescription).toMatchObject({
        planned_sets: 2,
        min_reps: 8,
        max_reps: 12,
      });
    } finally {
      await cleanUp(fixture);
    }
  });
});

/**
 * Reads every category MVP-REL-003 names, through the screens that own it.
 * Taking a page rather than using one keeps it usable for the reopened
 * context, where proving persistence actually matters.
 */
async function expectEverythingPresent(
  page: import("@playwright/test").Page,
  fixture: Fixture,
): Promise<void> {
  // Exercise definitions.
  await page.goto("/exercises");
  await expect(page.getByText(fixture.pressName)).toBeVisible();
  await expect(page.getByText(fixture.chinName)).toBeVisible();

  // Programs, the current-program flag, and the rotation pointer. The list row
  // carries all three, and the pointer sits on the second split rather than
  // the first, so a pointer that was lost and rebuilt cannot pass by accident.
  await page.goto("/programs");
  const programRow = page.getByRole("link", {
    name: new RegExp(fixture.program),
  });
  await expect(programRow).toContainText("Current");
  await expect(programRow).toContainText("3 splits");
  await expect(programRow).toContainText(`Next: ${fixture.pullSplit}`);

  // The splits themselves.
  await page.goto(`/programs/${fixture.programId}/edit`);
  await expect(page.getByText(fixture.pushSplit)).toBeVisible();
  await expect(page.getByText(fixture.pullSplit)).toBeVisible();
  await expect(page.getByText(fixture.legsSplit)).toBeVisible();

  // The active workout, offered from Today.
  await page.goto("/today");
  await expect(
    page.getByRole("link", { name: "Resume Workout" }),
  ).toBeVisible();

  // Completed and incomplete workouts, the latter marked as such.
  await page.goto("/history/workouts");
  await expect(
    page.getByRole("link", { name: new RegExp(fixture.pushSplit) }).first(),
  ).toBeVisible();
  const incomplete = page
    .getByRole("link", { name: new RegExp(fixture.legsSplit) })
    .first();
  await expect(incomplete).toBeVisible();
  await expect(incomplete).toContainText("Incomplete");

  // Weight entries.
  await page.goto("/body/weight");
  await expect(
    page.getByRole("list", { name: "Weigh-ins" }).getByRole("link"),
  ).toHaveCount(2);

  // Measurement types and their entries.
  await page.goto("/body/measurements");
  const measurements = page.getByRole("list", { name: "Measurements" });
  await expect(
    measurements.getByRole("link", { name: new RegExp(fixture.arm) }),
  ).toBeVisible();
  const waistRow = measurements.getByRole("link", {
    name: new RegExp(fixture.waist),
  });
  await expect(waistRow).toContainText("84 cm");
}

type Fixture = Awaited<ReturnType<typeof seed>>;

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Seeds one dataset that touches every category MVP-REL-003 names, through the
 * accepted operations rather than by writing rows directly, so what the
 * scenario reads back is what the application would have written.
 */
async function seed(stamp: string) {
  const client = adminClient();
  await client.from("workouts").delete().in("status", ["active", "paused"]);
  await removeMonth(client);

  const pressName = `Press ${stamp}`;
  const pressNote = "Brace hard before the first rep";
  const chinName = `Chin-Up ${stamp}`;
  const program = `Plan ${stamp}`;
  const pushSplit = `Push ${stamp}`;
  const pullSplit = `Pull ${stamp}`;
  const legsSplit = `Legs ${stamp}`;
  const waist = `Waist ${stamp}`;
  const arm = `Arm ${stamp}`;
  const workoutNote = "Left shoulder felt tight";

  const pressId = await rpc<string>(client, "create_exercise_definition", {
    p_name: pressName,
    p_base_type: "weights",
    p_persistent_note: pressNote,
    p_load_modes: ["weight"],
  });
  const chinId = await rpc<string>(client, "create_exercise_definition", {
    p_name: chinName,
    p_base_type: "bodyweight",
    p_persistent_note: "",
    p_load_modes: ["bodyweight"],
  });

  const programId = await rpc<string>(client, "create_program", {
    p_name: program,
  });
  const pushSplitId = await rpc<string>(client, "create_split_definition", {
    p_program_id: programId,
    p_name: pushSplit,
    p_exercise_ids: [pressId, chinId],
    p_planned_sets: [2, 1],
    p_min_reps: [8, 6],
    p_max_reps: [12, 12],
  });
  const pullSplitId = await rpc<string>(client, "create_split_definition", {
    p_program_id: programId,
    p_name: pullSplit,
    p_exercise_ids: [pressId],
    p_planned_sets: [2],
    p_min_reps: [8],
    p_max_reps: [12],
  });
  const legsSplitId = await rpc<string>(client, "create_split_definition", {
    p_program_id: programId,
    p_name: legsSplit,
    p_exercise_ids: [pressId],
    p_planned_sets: [1],
    p_min_reps: [10],
    p_max_reps: [15],
  });

  // The pointer sits on the second split deliberately: a rotation state that
  // is lost and rebuilt from scratch would land on the first one.
  await rpc(client, "set_current_program", {
    p_program_id: programId,
    p_next_split_id: pullSplitId,
  });

  const completedWorkoutId = await recordWorkout(client, {
    splitId: pushSplitId,
    startedAt: `${completedAt}T10:00:00Z`,
    finishedAt: `${completedAt}T11:00:00Z`,
    outcome: "completed",
    // The press keeps its second set empty on purpose, so the saved workout
    // also carries a planned set that was never recorded.
    entries: [
      {
        exerciseId: pressId,
        position: 1,
        loadMode: "weight",
        loadKg: 60,
        reps: 8,
      },
      {
        exerciseId: chinId,
        position: 1,
        loadMode: "bodyweight",
        loadKg: null,
        reps: 12,
      },
    ],
  });
  const incompleteWorkoutId = await recordWorkout(client, {
    splitId: legsSplitId,
    startedAt: `${incompleteAt}T10:00:00Z`,
    finishedAt: `${incompleteAt}T10:30:00Z`,
    outcome: "incomplete",
    entries: [
      {
        exerciseId: pressId,
        position: 1,
        loadMode: "weight",
        loadKg: 50,
        reps: 10,
      },
    ],
  });

  // One current workout, left active with an entered set and a note.
  await rpc(client, "start_workout", {
    p_source_kind: "proposed_split",
    p_split_id: pullSplitId,
    p_one_time_name: "",
    p_exercise_ids: [],
    p_started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  });
  const current = await currentWorkout(client);
  const sets = await workoutSets(client, current);
  await command(client, current, 0, "update_set", {
    workoutSetId: setFor(sets, pressId, 1).id,
    loadMode: "weight",
    loadKg: 60,
    bandDirection: null,
    bandStrength: null,
    reps: 8,
  });
  const { data: occurrence, error: occurrenceError } = await client
    .from("workout_exercises")
    .select("id")
    .eq("workout_id", current)
    .order("position")
    .limit(1)
    .single();
  if (occurrenceError) throw occurrenceError;
  await command(client, current, 1, "set_workout_exercise_note", {
    workoutExerciseId: occurrence.id,
    note: workoutNote,
  });

  for (const [entryDate, weightKg] of [
    [weighIns[0], 82],
    [weighIns[1], 83],
  ] as const) {
    await rpc(client, "create_weight_entry", {
      p_entry_date: entryDate,
      p_weight_kg: weightKg,
    });
  }

  const waistId = await measurementTypeId(client, waist);
  const armId = await measurementTypeId(client, arm);
  await rpc(client, "create_measurement_entry", {
    p_measurement_type_id: waistId,
    p_entry_date: measuredAt[0],
    p_value_cm: 84,
  });
  await rpc(client, "create_measurement_entry", {
    p_measurement_type_id: armId,
    p_entry_date: measuredAt[1],
    p_value_cm: 38,
  });

  return {
    pressId,
    pressName,
    pressNote,
    chinId,
    chinName,
    programId,
    program,
    pushSplitId,
    pushSplit,
    pullSplitId,
    pullSplit,
    legsSplitId,
    legsSplit,
    completedWorkoutId,
    incompleteWorkoutId,
    waistId,
    waist,
    armId,
    arm,
    workoutNote,
  };
}

async function recordWorkout(
  client: ReturnType<typeof adminClient>,
  options: {
    splitId: string;
    startedAt: string;
    finishedAt: string;
    outcome: "completed" | "incomplete";
    entries: {
      exerciseId: string;
      position: number;
      loadMode: string;
      loadKg: number | null;
      reps: number;
    }[];
  },
): Promise<string> {
  await rpc(client, "start_workout", {
    p_source_kind: "alternate_split",
    p_split_id: options.splitId,
    p_one_time_name: "",
    p_exercise_ids: [],
    p_started_at: options.startedAt,
  });
  const workoutId = await currentWorkout(client);
  const sets = await workoutSets(client, workoutId);

  let revision = 0;
  for (const entry of options.entries) {
    const target = setFor(sets, entry.exerciseId, entry.position);
    await command(client, workoutId, revision, "update_set", {
      workoutSetId: target.id,
      loadMode: entry.loadMode,
      loadKg: entry.loadKg,
      bandDirection: null,
      bandStrength: null,
      reps: entry.reps,
    });
    revision += 1;
  }

  await command(client, workoutId, revision, "finish_workout", {
    outcome: options.outcome,
    finishedAt: options.finishedAt,
  });
  return workoutId;
}

async function currentWorkout(
  client: ReturnType<typeof adminClient>,
): Promise<string> {
  const { data, error } = await client
    .from("workouts")
    .select("id")
    .in("status", ["active", "paused"])
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Expected the seeded workout to be current.");
  return data.id;
}

/**
 * Returns each starter set with the exercise it belongs to. A set is addressed
 * by that exercise and its own position rather than by a flat index: ordering
 * an embedded resource orders the embedding, not the rows, so a flat index
 * would silently point at another exercise's set and record a value its
 * snapshot does not allow.
 */
async function workoutSets(
  client: ReturnType<typeof adminClient>,
  workoutId: string,
): Promise<{ id: string; position: number; exerciseId: string }[]> {
  const { data, error } = await client
    .from("workout_sets")
    .select("id, position, workout_exercises!inner(workout_id, exercise_id)")
    .eq("workout_exercises.workout_id", workoutId);
  if (error) throw error;
  if (!data?.length) throw new Error("Expected snapshotted starter sets.");
  return data.map((row) => {
    const parent = row.workout_exercises as unknown as {
      exercise_id: string | null;
    };
    if (parent.exercise_id === null)
      throw new Error("Expected the seeded occurrence to keep its exercise.");
    return {
      id: row.id,
      position: row.position,
      exerciseId: parent.exercise_id,
    };
  });
}

function setFor(
  sets: { id: string; position: number; exerciseId: string }[],
  exerciseId: string,
  position: number,
): { id: string } {
  const found = sets.find(
    (set) => set.exerciseId === exerciseId && set.position === position,
  );
  if (!found)
    throw new Error(
      `Expected a starter set at position ${position} of ${exerciseId}.`,
    );
  return found;
}

async function command(
  client: ReturnType<typeof adminClient>,
  workoutId: string,
  expectedRevision: number,
  operation: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await rpc(client, "apply_active_workout_command", {
    p_command_id: randomUUID(),
    p_workout_id: workoutId,
    p_expected_revision: expectedRevision,
    p_operation: operation,
    p_payload: payload,
    p_client_created_at: new Date().toISOString(),
  });
}

async function measurementTypeId(
  client: ReturnType<typeof adminClient>,
  name: string,
): Promise<string> {
  const created = await rpc<{ id: string }>(client, "create_measurement_type", {
    p_name: name,
  });
  return created.id;
}

/**
 * Removes everything the fixture created. Every step is checked: a measurement
 * type cannot be deleted while its entries exist, which is the rule
 * MVP-BOD-001 states and the entries table enforces with `on delete restrict`,
 * so entries go first and a teardown that fails says so instead of quietly
 * leaving rows behind for the next run to trip over.
 */
async function cleanUp(fixture: Fixture) {
  const client = adminClient();
  const types = [fixture.waistId, fixture.armId];

  await mustSucceed(
    client.from("workouts").delete().in("status", ["active", "paused"]),
  );
  await mustSucceed(
    client
      .from("workouts")
      .delete()
      .in("id", [fixture.completedWorkoutId, fixture.incompleteWorkoutId]),
  );
  await mustSucceed(
    client
      .from("app_settings")
      .update({ current_program_id: null })
      .eq("id", 1),
  );
  await mustSucceed(
    client.from("programs").delete().eq("id", fixture.programId),
  );
  await mustSucceed(
    client
      .from("exercises")
      .delete()
      .in("id", [fixture.pressId, fixture.chinId]),
  );
  await mustSucceed(
    client
      .from("measurement_entries")
      .delete()
      .in("measurement_type_id", types),
  );
  await mustSucceed(client.from("measurement_types").delete().in("id", types));
  await removeMonth(client);
}

async function mustSucceed(
  request: PromiseLike<{ error: { message: string } | null }>,
): Promise<void> {
  const { error } = await request;
  if (error) throw new Error(`Teardown step failed: ${error.message}`);
}

async function removeMonth(client: ReturnType<typeof adminClient>) {
  const { error } = await client
    .from("weight_entries")
    .delete()
    .gte("entry_date", month.from)
    .lte("entry_date", month.to);
  if (error) throw error;
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
