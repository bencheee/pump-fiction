import { readdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

// F-010 owns MVP-UX-001 through MVP-UX-003. Each Feature met them on its own
// screens; nothing yet checks them across the whole application at once, which
// is the only way a route that quietly stopped reflowing gets noticed.
//
// The accepted reflow range is 320 to 430 CSS pixels and the two fixed design
// references sit inside it, so those four widths are the ones that matter.
const widths = [320, 360, 390, 430];

const month = { from: "2026-04-01", to: "2026-04-30" };
const workoutAt = "2026-04-14";
const weighInAt = "2026-04-10";
const measuredAt = "2026-04-10";

test.describe("Local MVP phone interaction", () => {
  test("covers every delivered route", async () => {
    // The inventory is read out of the application rather than written by
    // hand, so a route added later cannot escape this sweep: it appears here
    // with no fixture and this test names it.
    const delivered = deliveredRoutes();
    const covered = new Set(Object.keys(routeFixtures));
    const uncovered = delivered.filter((route) => !covered.has(route));
    expect(uncovered, "every delivered route needs a fixture URL").toEqual([]);

    // And a fixture that outlives its route is dead weight.
    const stale = [...covered].filter((route) => !delivered.includes(route));
    expect(stale, "every fixture URL needs a delivered route").toEqual([]);
  });

  test("reflows every route across the accepted phone range", async ({
    page,
  }, testInfo) => {
    const fixture = await seed(`${testInfo.project.name} ${Date.now()}`);

    try {
      for (const route of deliveredRoutes()) {
        const url = routeFixtures[route](fixture);
        await page.goto(url);

        for (const width of widths) {
          // Resizing rather than reloading keeps the sweep to one navigation
          // per route while still measuring every accepted width.
          await page.setViewportSize({ width, height: 780 });
          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          );
          expect(
            overflow,
            `${url} overflows at ${width} px`,
          ).toBeLessThanOrEqual(1);
        }
      }

      await page.setViewportSize({ width: 390, height: 844 });
      await testInfo.attach(`phone-reflow-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
    } finally {
      await cleanUp(fixture);
    }
  });

  test("asks for the right keyboard wherever a number is entered", async ({
    page,
  }, testInfo) => {
    const fixture = await seed(`${testInfo.project.name} ${Date.now()}`);

    try {
      // Every screen that takes a number, and what each number is: reps are
      // whole, so they ask for the numeric keypad; loads, weights, and
      // measurements are decimal.
      const numericScreens = [
        "/exercises/new",
        `/programs/${fixture.programId}/splits/new`,
        "/workout/current",
        "/history/weight/new",
        `/history/body/${fixture.typeId}/new`,
        `/history/workouts/${fixture.workoutId}/edit`,
      ];

      for (const url of numericScreens) {
        await page.goto(url);
        const modes = await page.evaluate(() =>
          [...document.querySelectorAll("input")]
            .filter((input) => input.type !== "hidden")
            .map((input) => ({
              label:
                input.getAttribute("aria-label") ??
                document
                  .querySelector(`label[for="${input.id}"]`)
                  ?.textContent?.trim() ??
                input.id,
              type: input.type,
              inputMode: input.inputMode,
              className: input.className,
            })),
        );

        for (const field of modes) {
          // A numeric field is the one the application styles as numeric; a
          // date input carries its own picker and needs no inputmode.
          if (!field.className.includes("pf-numeric")) continue;
          expect(
            ["decimal", "numeric"],
            `${url}: ${field.label} should request a numeric keyboard`,
          ).toContain(field.inputMode);
        }
      }
    } finally {
      await cleanUp(fixture);
    }
  });

  test("offers named reorder controls and saves a completed reorder", async ({
    page,
  }, testInfo) => {
    const fixture = await seed(`${testInfo.project.name} ${Date.now()}`);

    try {
      // MVP-UX-002 as T-050 corrected it: every reorderable list carries a
      // pair of named controls on each row, unavailable at the ends. The
      // program holds two splits, so both ends are visible at once.
      await page.goto(`/programs/${fixture.programId}/edit`);
      const firstUp = page.getByRole("button", {
        name: `Move ${fixture.splitA} up`,
      });
      const firstDown = page.getByRole("button", {
        name: `Move ${fixture.splitA} down`,
      });
      const lastUp = page.getByRole("button", {
        name: `Move ${fixture.splitB} up`,
      });
      const lastDown = page.getByRole("button", {
        name: `Move ${fixture.splitB} down`,
      });
      await expect(firstUp).toBeDisabled();
      await expect(firstDown).toBeEnabled();
      await expect(lastUp).toBeEnabled();
      await expect(lastDown).toBeDisabled();

      // Each control is a real phone target, not an icon a thumb misses.
      for (const control of [firstDown, lastUp]) {
        const box = await control.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }

      // The other reorderable lists carry the same controls.
      for (const [url, name] of [
        [`/splits/${fixture.splitBId}/edit`, fixture.exercise],
        ["/workout/current", fixture.exercise],
        [`/history/workouts/${fixture.workoutId}/edit`, fixture.exercise],
      ] as const) {
        await page.goto(url);
        await expect(
          page.getByRole("button", { name: `Move ${name} up` }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: `Move ${name} down` }),
        ).toBeVisible();
      }

      await page.goto(`/programs/${fixture.programId}/edit`);
      await page
        .getByRole("button", { name: `Move ${fixture.splitA} down` })
        .click();
      await expect(page.getByText("Order saved.")).toBeVisible();

      // No save control appears for the order: it is already saved.
      await expect(
        page.getByRole("button", { name: /save order/i }),
      ).toHaveCount(0);

      // And it survives a reload, which is what "saved" has to mean.
      await page.reload();
      const rows = page.getByRole("link", {
        name: new RegExp(`${fixture.splitA}|${fixture.splitB}`),
      });
      await expect(rows.first()).toContainText(fixture.splitB);
    } finally {
      await cleanUp(fixture);
    }
  });

  test("asks before every destructive removal", async ({ page }, testInfo) => {
    const fixture = await seed(`${testInfo.project.name} ${Date.now()}`);

    try {
      // MVP-UX-003 names three cases explicitly; ADR-0024 added the
      // definition deletions, which the same rule covers.
      await expectConfirmed(page, `/history/workouts/${fixture.workoutId}`, {
        name: "Delete workout",
        exact: true,
      });
      await expectConfirmed(page, "/workout/current/finish", {
        name: "Discard Workout",
      });
      await expectConfirmed(page, `/exercises/${fixture.exerciseId}/edit`, {
        name: "Delete Exercise",
      });
      await expectConfirmed(page, `/splits/${fixture.splitBId}/edit`, {
        name: "Delete Split",
      });
      await expectConfirmed(page, `/history/weight/${weighInAt}/edit`, {
        name: "Delete Entry",
      });
      await expectConfirmed(
        page,
        `/history/body/${fixture.typeId}/${measuredAt}/edit`,
        { name: "Delete Entry" },
      );

      await testInfo.attach(`phone-destructive-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
    } finally {
      await cleanUp(fixture);
    }
  });
});

/**
 * Opens a screen, presses its destructive control, and requires the O01
 * confirmation to stand between the press and the removal. Cancelling leaves
 * the screen where it was, which is the part that proves the gate is real.
 */
async function expectConfirmed(
  page: Page,
  url: string,
  control: { name: string; exact?: boolean },
): Promise<void> {
  await page.goto(url);
  await page
    .getByRole("button", { name: control.name, exact: control.exact })
    .first()
    .click();

  const dialog = page.getByRole("alertdialog");
  await expect(
    dialog,
    `${url}: ${control.name} must confirm first`,
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(url)}$`));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Every `(main)` route the application delivers, derived from its own route
 * files. Route groups disappear from the URL and dynamic segments keep their
 * bracket form, so a pattern here matches a key in `routeFixtures`.
 */
function deliveredRoutes(): string[] {
  const root = join(process.cwd(), "src", "app", "(main)");
  const routes: string[] = [];

  const walk = (directory: string, segments: string[]) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const group = entry.name.startsWith("(") && entry.name.endsWith(")");
        walk(
          join(directory, entry.name),
          group ? segments : [...segments, entry.name],
        );
      } else if (entry.name === "page.tsx") {
        routes.push(`/${segments.join("/")}`);
      }
    }
  };

  walk(root, []);
  return routes.sort();
}

type Fixture = Awaited<ReturnType<typeof seed>>;

// One concrete URL per delivered route. A route whose screen needs a record
// takes it from the fixture, so the sweep always lands on a populated screen
// rather than an empty state that reflows more easily than the real thing.
const routeFixtures: Record<string, (fixture: Fixture) => string> = {
  "/exercises": () => "/exercises",
  "/exercises/new": () => "/exercises/new",
  "/exercises/[id]/edit": (f) => `/exercises/${f.exerciseId}/edit`,
  "/history": () => "/history",
  "/history/body": () => "/history/body",
  "/history/body/[typeId]": (f) => `/history/body/${f.typeId}`,
  "/history/body/[typeId]/[date]/edit": (f) =>
    `/history/body/${f.typeId}/${measuredAt}/edit`,
  "/history/body/[typeId]/new": (f) => `/history/body/${f.typeId}/new`,
  "/history/body/types/[id]/edit": (f) =>
    `/history/body/types/${f.typeId}/edit`,
  "/history/body/types/new": () => "/history/body/types/new",
  "/history/exercises": () => "/history/exercises",
  "/history/exercises/[id]": (f) => `/history/exercises/${f.exerciseId}`,
  "/history/splits": () => "/history/splits",
  "/history/splits/[id]": (f) => `/history/splits/${f.splitAId}`,
  "/history/weight": () => "/history/weight",
  "/history/weight/[date]/edit": () => `/history/weight/${weighInAt}/edit`,
  "/history/weight/new": () => "/history/weight/new",
  "/history/workouts": () => "/history/workouts",
  "/history/workouts/[id]": (f) => `/history/workouts/${f.workoutId}`,
  "/history/workouts/[id]/edit": (f) => `/history/workouts/${f.workoutId}/edit`,
  "/programs": () => "/programs",
  "/programs/[id]/edit": (f) => `/programs/${f.programId}/edit`,
  "/programs/[id]/splits/new": (f) => `/programs/${f.programId}/splits/new`,
  "/programs/new": () => "/programs/new",
  "/splits/[id]/edit": (f) => `/splits/${f.splitBId}/edit`,
  "/today": () => "/today",
  "/today/one-time": () => "/today/one-time",
  "/workout/current": () => "/workout/current",
  "/workout/current/finish": () => "/workout/current/finish",
};

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * One populated dataset: every route in the inventory has something real to
 * render, including a current workout for the two workout routes.
 */
async function seed(stamp: string) {
  const client = adminClient();
  await mustSucceed(
    client.from("workouts").delete().in("status", ["active", "paused"]),
  );
  await removeMonth(client);

  const exercise = `Press ${stamp}`;
  const program = `Plan ${stamp}`;
  const splitA = `Push ${stamp}`;
  const splitB = `Pull ${stamp}`;
  const measurement = `Waist ${stamp}`;

  const exerciseId = await rpc<string>(client, "create_exercise_definition", {
    p_name: exercise,
    p_base_type: "weights",
    p_persistent_note: "Brace hard",
    p_load_modes: ["weight"],
  });
  const programId = await rpc<string>(client, "create_program", {
    p_name: program,
  });
  const splitAId = await rpc<string>(client, "create_split_definition", {
    p_program_id: programId,
    p_name: splitA,
    p_exercise_ids: [exerciseId],
    p_planned_sets: [2],
    p_min_reps: [8],
    p_max_reps: [12],
  });
  const splitBId = await rpc<string>(client, "create_split_definition", {
    p_program_id: programId,
    p_name: splitB,
    p_exercise_ids: [exerciseId],
    p_planned_sets: [1],
    p_min_reps: [6],
    p_max_reps: [10],
  });
  await rpc(client, "set_current_program", {
    p_program_id: programId,
    p_next_split_id: splitAId,
  });

  // One completed workout for History, then one current workout that stays
  // active so /workout/current and its finish review have something to show.
  const workoutId = await recordCompleted(client, splitAId, exerciseId);
  await rpc(client, "start_workout", {
    p_source_kind: "proposed_split",
    p_split_id: splitAId,
    p_one_time_name: "",
    p_exercise_ids: [],
    p_started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  });

  await rpc(client, "create_weight_entry", {
    p_entry_date: weighInAt,
    p_weight_kg: 82,
  });
  const type = await rpc<{ id: string }>(client, "create_measurement_type", {
    p_name: measurement,
  });
  await rpc(client, "create_measurement_entry", {
    p_measurement_type_id: type.id,
    p_entry_date: measuredAt,
    p_value_cm: 84,
  });

  return {
    exercise,
    exerciseId,
    programId,
    splitA,
    splitAId,
    splitB,
    splitBId,
    workoutId,
    typeId: type.id,
  };
}

async function recordCompleted(
  client: ReturnType<typeof adminClient>,
  splitId: string,
  exerciseId: string,
): Promise<string> {
  await rpc(client, "start_workout", {
    p_source_kind: "alternate_split",
    p_split_id: splitId,
    p_one_time_name: "",
    p_exercise_ids: [],
    p_started_at: `${workoutAt}T10:00:00Z`,
  });
  const workoutId = await currentWorkout(client);
  const sets = await workoutSets(client, workoutId);
  const first = sets.find(
    (set) => set.exerciseId === exerciseId && set.position === 1,
  );
  if (!first) throw new Error("Expected a snapshotted starter set.");

  await command(client, workoutId, 0, "update_set", {
    workoutSetId: first.id,
    loadMode: "weight",
    loadKg: 60,
    bandDirection: null,
    bandStrength: null,
    reps: 8,
  });
  await command(client, workoutId, 1, "finish_workout", {
    outcome: "completed",
    finishedAt: `${workoutAt}T11:00:00Z`,
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
      throw new Error("Expected the occurrence to keep its exercise.");
    return {
      id: row.id,
      position: row.position,
      exerciseId: parent.exercise_id,
    };
  });
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

async function cleanUp(fixture: Fixture) {
  const client = adminClient();
  await mustSucceed(
    client.from("workouts").delete().in("status", ["active", "paused"]),
  );
  await mustSucceed(
    client.from("workouts").delete().eq("id", fixture.workoutId),
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
    client.from("exercises").delete().eq("id", fixture.exerciseId),
  );
  await mustSucceed(
    client
      .from("measurement_entries")
      .delete()
      .eq("measurement_type_id", fixture.typeId),
  );
  await mustSucceed(
    client.from("measurement_types").delete().eq("id", fixture.typeId),
  );
  await removeMonth(client);
}

async function removeMonth(client: ReturnType<typeof adminClient>) {
  await mustSucceed(
    client
      .from("weight_entries")
      .delete()
      .gte("entry_date", month.from)
      .lte("entry_date", month.to),
  );
}

async function mustSucceed(
  request: PromiseLike<{ error: { message: string } | null }>,
): Promise<void> {
  const { error } = await request;
  if (error) throw new Error(`Fixture step failed: ${error.message}`);
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
