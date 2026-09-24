// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  WeightEntryChange,
  WeightOverview,
} from "@/features/history/domain/weight";
import { ToastProvider } from "@/shared/ui";

import { WeightView } from "./weight-view";

const actions = vi.hoisted(() => ({
  load: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/app/actions/weight", () => ({
  getWeightProgressAction: actions.load,
  createWeightEntryAction: actions.create,
  updateWeightEntryAction: actions.update,
  deleteWeightEntryAction: actions.remove,
}));

const router = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

// 6 September 2026 is a Sunday, so the week of Mon 31 Aug is final.
const today = "2026-09-06";
const id = (n: number) =>
  `39000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const entries: readonly WeightEntryChange[] = [
  { id: id(2), entryDate: "2026-09-01", weightKg: 81.5, changeKg: -1 },
  { id: id(1), entryDate: "2026-08-31", weightKg: 82.5, changeKg: null },
];

function overview(overrides: Partial<WeightOverview> = {}): WeightOverview {
  return {
    localDate: today,
    latest: entries[0],
    currentWeek: {
      weekStart: "2026-08-31",
      weekEnd: "2026-09-06",
      averageKg: 82,
      recordedDays: 2,
      changeKg: -1,
      provisional: false,
    },
    entries,
    ...overrides,
  };
}

const saved = { id: id(9), entryDate: today, weightKg: 82.4 };

/** A stat tile is its label, value and detail; it is not a named region. */
function tile(label: string) {
  const element = screen
    .getByText(label, { selector: "[data-stat-card] > p" })
    .closest<HTMLElement>("[data-stat-card]");
  if (!element) throw new Error(`No tile for ${label}`);
  return within(element);
}

/** The chart card's bars: one button per drawn day or week. */
function bars() {
  const chart = document.querySelector("[data-bar-chart]");
  if (!chart) throw new Error("No chart");
  return [
    ...chart.querySelectorAll<HTMLButtonElement>(
      "[data-bar-chart-bars] button",
    ),
  ];
}

function chartSummary() {
  return document.querySelector("[data-bar-chart-summary]");
}

function chartReading() {
  return document.querySelector("[data-bar-chart-reading]");
}

function renderWeight(value: WeightOverview = overview()) {
  return render(
    <ToastProvider>
      <WeightView overview={value} />
    </ToastProvider>,
  );
}

/** The toast is outside the modal panel, which hides it from role queries. */
function findToast(message: string) {
  return screen.findByText(message, { selector: "[data-toast-message]" });
}

async function openPanel(user: UserEvent, trigger: string | RegExp) {
  await user.click(screen.getByRole("button", { name: trigger }));
  return screen.findByRole("dialog", { name: /weigh-in/ });
}

/** The Body entry panel saves through its Actions panel: pick, then Continue. */
async function runAction(user: UserEvent, panel: HTMLElement, label: string) {
  await user.click(within(panel).getByRole("button", { name: "Actions" }));
  const menu = await screen.findByRole("dialog", { name: "Actions" });
  await user.click(within(menu).getByRole("button", { name: label }));
  await user.click(within(menu).getByRole("button", { name: "Continue" }));
}

async function actionLabels(user: UserEvent, panel: HTMLElement) {
  await user.click(within(panel).getByRole("button", { name: "Actions" }));
  const menu = await screen.findByRole("dialog", { name: "Actions" });
  return [...menu.querySelectorAll("[data-actions-item]")].map((item) =>
    item.getAttribute("aria-label"),
  );
}

async function chooseDay(user: UserEvent, panel: HTMLElement, day: string) {
  await user.click(within(panel).getByRole("button", { name: "Choose date" }));
  const picker = await screen.findByRole("dialog", { name: "Choose date" });
  if (!within(picker).queryByRole("button", { name: day }))
    await user.click(
      within(picker).getByRole("button", { name: "Previous month" }),
    );
  await user.click(within(picker).getByRole("button", { name: day }));
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Choose date" }),
    ).not.toBeInTheDocument(),
  );
}

describe("S19 Weight", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows the latest weigh-in, its change, and this week", () => {
    renderWeight();

    const latest = tile("Latest");
    expect(latest.getByText("81.5 kg")).toBeVisible();
    expect(
      latest.getByText("Tue 1 Sept · −1.0 kg since the previous weigh-in"),
    ).toBeVisible();

    const week = tile("This week");
    expect(week.getByText("82.0 kg")).toBeVisible();
    expect(
      week.getByText("−1.0 kg vs last week · 2/7 days · Final"),
    ).toBeVisible();
  });

  it("counts the weigh-ins beside the tabs", () => {
    renderWeight();
    expect(screen.getByText("2 weigh-ins")).toBeVisible();

    cleanup();
    renderWeight(overview({ entries: [entries[1]], latest: entries[1] }));
    expect(screen.getByText("1 weigh-in")).toBeVisible();
    // The first weigh-in has nothing to compare with, and says nothing.
    expect(tile("Latest").getByText("Mon 31 Aug")).toBeVisible();
  });

  it("says the weekly change is unavailable rather than zero", () => {
    const base = overview();
    renderWeight(
      overview({ currentWeek: { ...base.currentWeek!, changeKg: null } }),
    );
    const week = tile("This week");
    expect(week.getByText(/No previous week to compare/)).toBeVisible();
    expect(week.queryByText(/0.0 kg vs last week/)).not.toBeInTheDocument();
  });

  it("marks the current week provisional before its Sunday", () => {
    const base = overview();
    renderWeight(
      overview({ currentWeek: { ...base.currentWeek!, provisional: true } }),
    );
    expect(
      tile("This week").getByText(/Provisional until Sunday/),
    ).toBeVisible();
  });

  it("lists every weigh-in newest first with its change and edit control", () => {
    renderWeight();
    // Step 20: a row opens the weigh-in in the Body entry panel, where it
    // used to link to the deleted /body/weight/[date]/edit route.
    const rows = screen.getAllByRole("button", { name: /^Edit weigh-in / });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAccessibleName("Edit weigh-in Tue 1 Sept");
    expect(rows[0]).toHaveTextContent("81.5 kg");
    expect(rows[0]).toHaveTextContent("Tue 1 Sept · −1.0 kg");
    expect(rows[1]).toHaveTextContent("82.5 kg");
    expect(rows[1]).toHaveTextContent(/^82.5 kgMon 31 Aug$/);
  });

  it("offers the four weight ranges, opens on the quarter, and redraws in place", async () => {
    const user = userEvent.setup();
    renderWeight(
      overview({
        entries: [
          entries[0],
          { ...entries[1], changeKg: -0.5 },
          { id: id(0), entryDate: "2026-07-20", weightKg: 83, changeKg: null },
        ],
      }),
    );

    const ranges = within(screen.getByRole("group", { name: "Time range" }));
    expect(ranges.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Week",
      "Month",
      "Quarter",
      "Year",
    ]);
    // Step 18: the chart opens on the quarter (`defaultWeightRange`).
    expect(ranges.getByRole("button", { name: "Quarter" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // Daily draws every day from the first weigh-in, 20 Jul, to today.
    expect(bars()).toHaveLength(49);
    expect(chartSummary()).toHaveTextContent(
      "3 weigh-ins in range: 83 kg to 81.5 kg, lowest 81.5 kg, highest 83 kg.",
    );

    // Step 18: the chips answer from the weigh-ins already on the screen,
    // where they used to reload the series through a server action.
    await user.click(ranges.getByRole("button", { name: "Month" }));
    expect(ranges.getByRole("button", { name: "Month" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(chartSummary()).toHaveTextContent(
      "2 weigh-ins in range: 82.5 kg to 81.5 kg, lowest 81.5 kg, highest 82.5 kg.",
    );

    await user.click(ranges.getByRole("button", { name: "Week" }));
    expect(bars()).toHaveLength(7);
    expect(bars()[0]).toHaveAccessibleName("Mon 31 Aug · 82.5 kg");

    await user.click(ranges.getByRole("button", { name: "Year" }));
    expect(bars()).toHaveLength(49);
    expect(actions.load).not.toHaveBeenCalled();
  });

  // A month whose first weeks hold no weigh-in draws them as empty columns
  // when the record began before it (Owner decision 4 after step 21).
  it("draws the empty days at the start of a range the record already covered", async () => {
    const user = userEvent.setup();
    renderWeight(
      overview({
        entries: [
          entries[0],
          { ...entries[1], changeKg: -0.5 },
          {
            id: id(0),
            entryDate: "2026-07-20",
            weightKg: 83,
            changeKg: null,
          },
        ],
      }),
    );
    await user.click(screen.getByRole("button", { name: "Month" }));
    // 6 August to 6 September, the record having begun on 20 July.
    expect(bars()).toHaveLength(32);
    expect(bars()[0]).toHaveAccessibleName("Thu 6 Aug · No weigh-in");
  });

  it("draws a day without a weigh-in as an empty column", async () => {
    const user = userEvent.setup();
    renderWeight();

    // Owner decision 4 after step 21: daily draws every day of the range.
    const days = bars();
    expect(days.map((bar) => bar.getAttribute("aria-label"))).toEqual([
      "Mon 31 Aug · 82.5 kg",
      "Tue 1 Sept · 81.5 kg",
      "Wed 2 Sept · No weigh-in",
      "Thu 3 Sept · No weigh-in",
      "Fri 4 Sept · No weigh-in",
      "Sat 5 Sept · No weigh-in",
      "Sun 6 Sept · No weigh-in",
    ]);
    expect(days[2]).toHaveAttribute("data-empty");

    // The reading opens on the latest weigh-in, not on an empty today.
    expect(chartReading()).toHaveTextContent("Tue 1 Sept81.5 kg");
    expect(days[1]).toHaveAttribute("aria-pressed", "true");

    // ADR-0033: a press, not a hover, moves the reading.
    await user.click(days[0]);
    expect(chartReading()).toHaveTextContent("Mon 31 Aug82.5 kg");
    await user.click(days[4]);
    expect(chartReading()).toHaveTextContent("Fri 4 Sept—");
  });

  it("carries the daily chart in a sentence and an accessible list", async () => {
    const user = userEvent.setup();
    renderWeight();

    expect(chartSummary()).toHaveTextContent(
      "2 weigh-ins in range: 82.5 kg to 81.5 kg, lowest 81.5 kg, highest 82.5 kg.",
    );

    const toggle = screen.getByRole("button", { name: "Chart values" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    // Newest first, and the empty days are not values.
    const values = within(screen.getByRole("list", { name: "Chart values" }));
    const items = values.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Tue 1 Sept81.5 kg");
    expect(items[1]).toHaveTextContent("Mon 31 Aug82.5 kg");
  });

  it("switches the chart to weekly averages with their n/7 and status", async () => {
    const user = userEvent.setup();
    renderWeight(
      overview({
        localDate: "2026-09-03",
        entries: [
          entries[0],
          { ...entries[1], changeKg: -0.5 },
          { id: id(0), entryDate: "2026-08-25", weightKg: 83, changeKg: null },
        ],
      }),
    );

    // Owner decision 4 after step 21: a Daily / Weekly average switch
    // replaces the separate weekly-averages list of the old chart.
    const view = within(screen.getByRole("group", { name: "Chart" }));
    expect(view.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Daily",
      "Weekly average",
    ]);
    expect(view.getByRole("button", { name: "Daily" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(view.getByRole("button", { name: "Weekly average" }));
    expect(bars().map((bar) => bar.getAttribute("aria-label"))).toEqual([
      "Week of Mon 24 Aug · 83.0 kg · 1/7 days",
      "Week of Mon 31 Aug · 82.0 kg · 2/7 days · provisional",
    ]);
    expect(chartSummary()).toHaveTextContent(
      "2 weeks in range: 83.0 kg to 82.0 kg, lowest 82.0 kg, highest 83.0 kg.",
    );
    expect(chartReading()).toHaveTextContent("Week of Mon 31 Aug82.0 kg");

    await user.click(screen.getByRole("button", { name: "Chart values" }));
    const items = within(
      screen.getByRole("list", { name: "Chart values" }),
    ).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Week of Mon 31 Aug82.0 kg",
      "Week of Mon 24 Aug83.0 kg",
    ]);
  });

  it("invites the first weigh-in instead of fabricating a zero", () => {
    renderWeight({
      localDate: today,
      latest: null,
      currentWeek: null,
      entries: [],
    });

    // Step 18: the prototype keeps its tiles and chips on an empty record and
    // states no value in them, where the old screen hid both.
    expect(tile("Latest").getByText("—")).toBeVisible();
    expect(tile("Latest").getByText("No weigh-in yet")).toBeVisible();
    expect(
      tile("This week").getByText("No weigh-in this week yet"),
    ).toBeVisible();
    expect(screen.getByText("0 weigh-ins")).toBeVisible();
    expect(
      screen.getByText("No weigh-in falls inside this range."),
    ).toBeVisible();
    expect(screen.getByText(/No weigh-in yet\. Add today/)).toBeVisible();
    expect(screen.queryByText(/0\.0 kg/)).toBeNull();
    expect(screen.queryByRole("button", { name: /^Edit weigh-in/ })).toBeNull();
  });
});

describe("S20 weight entry", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("opens a new weigh-in on the local date", async () => {
    const user = userEvent.setup();
    renderWeight();

    const panel = await openPanel(user, "Add weigh-in");
    expect(panel).toHaveAccessibleName("Add weigh-in");
    expect(
      within(panel).getByRole("button", { name: "Choose date" }),
    ).toHaveTextContent("Sun 6 Sept");
    expect(within(panel).getByLabelText("Weight (kg)")).toHaveValue("");
    expect(
      within(panel).getByText("An earlier date is fine. A future one is not."),
    ).toBeVisible();
    // Nothing exists yet, so nothing can be deleted.
    expect(await actionLabels(user, panel)).toEqual(["Save weigh-in"]);
  });

  it("opens today's weigh-in when today already holds one", async () => {
    const user = userEvent.setup();
    const todays = {
      id: id(3),
      entryDate: today,
      weightKg: 81.9,
      changeKg: 0.4,
    };
    renderWeight(overview({ entries: [todays, ...entries], latest: todays }));

    const panel = await openPanel(user, "Add weigh-in");
    expect(panel).toHaveAccessibleName("Edit weigh-in");
    expect(within(panel).getByLabelText("Weight (kg)")).toHaveValue("81.9");
    expect(await actionLabels(user, panel)).toEqual([
      "Save weigh-in",
      "Delete entry",
    ]);
  });

  it("offers no future date", async () => {
    const user = userEvent.setup();
    renderWeight();

    const panel = await openPanel(user, "Add weigh-in");
    await user.click(
      within(panel).getByRole("button", { name: "Choose date" }),
    );
    const picker = within(
      await screen.findByRole("dialog", { name: "Choose date" }),
    );

    // Step 20: the date picker replaces the date input, so a future date is
    // refused by being unreachable rather than by an inline message.
    expect(picker.getByRole("group", { name: "September 2026" })).toBeVisible();
    expect(picker.getByRole("button", { name: "Sun 6 Sept" })).toBeEnabled();
    expect(picker.getByRole("button", { name: "Sun 6 Sept" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(picker.getByRole("button", { name: "Mon 7 Sept" })).toBeDisabled();
    expect(picker.getByRole("button", { name: "Wed 30 Sept" })).toBeDisabled();
    expect(picker.getByRole("button", { name: "Next month" })).toBeDisabled();
  });

  it("refuses an empty and a non-numeric weight and keeps the panel open", async () => {
    const user = userEvent.setup();
    renderWeight();

    const panel = await openPanel(user, "Add weigh-in");
    await runAction(user, panel, "Save weigh-in");
    // Step 20 takes the prototype's refusal for both cases.
    expect(await findToast("Enter a number.")).toBeInTheDocument();

    await user.type(within(panel).getByLabelText("Weight (kg)"), "eighty");
    await runAction(user, panel, "Save weigh-in");
    await waitFor(() =>
      expect(screen.getAllByText("Enter a number.").length).toBeGreaterThan(0),
    );
    expect(screen.getByRole("dialog", { name: "Add weigh-in" })).toBeVisible();
    expect(within(panel).getByLabelText("Weight (kg)")).toHaveValue("eighty");
    expect(actions.create).not.toHaveBeenCalled();
  });

  it("refuses more than two decimals through the domain validator", async () => {
    const user = userEvent.setup();
    renderWeight();

    const panel = await openPanel(user, "Add weigh-in");
    await user.type(within(panel).getByLabelText("Weight (kg)"), "82.456");
    await runAction(user, panel, "Save weigh-in");

    expect(await findToast("Use at most two decimals.")).toBeInTheDocument();
    expect(actions.create).not.toHaveBeenCalled();
  });

  it("accepts a comma as the decimal separator", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: saved });
    renderWeight();

    const panel = await openPanel(user, "Add weigh-in");
    await user.type(within(panel).getByLabelText("Weight (kg)"), "89,2");
    await runAction(user, panel, "Save weigh-in");

    await waitFor(() =>
      expect(actions.create).toHaveBeenCalledWith(
        expect.objectContaining({ weightKg: 89.2 }),
      ),
    );
  });

  it("saves a new weigh-in and stays on Weight", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: saved });
    renderWeight();

    const panel = await openPanel(user, "Add weigh-in");
    await user.type(within(panel).getByLabelText("Weight (kg)"), "82.4");
    await runAction(user, panel, "Save weigh-in");

    await waitFor(() =>
      expect(actions.create).toHaveBeenCalledWith({
        entryDate: today,
        weightKg: 82.4,
      }),
    );
    expect(await findToast("Weigh-in saved.")).toBeInTheDocument();
    // Step 20: the panel closes over Weight and refreshes it; there is no
    // form route to leave any more.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(router.refresh).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
    expect(actions.update).not.toHaveBeenCalled();
  });

  it("records a weigh-in for an earlier date", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: saved });
    renderWeight();

    const panel = await openPanel(user, "Add weigh-in");
    await chooseDay(user, panel, "Sat 15 Aug");
    expect(
      within(panel).getByRole("button", { name: "Choose date" }),
    ).toHaveTextContent("Sat 15 Aug");

    await user.type(within(panel).getByLabelText("Weight (kg)"), "83.1");
    await runAction(user, panel, "Save weigh-in");

    await waitFor(() =>
      expect(actions.create).toHaveBeenCalledWith({
        entryDate: "2026-08-15",
        weightKg: 83.1,
      }),
    );
  });

  it("corrects the weigh-in a chosen date already holds", async () => {
    const user = userEvent.setup();
    actions.update.mockResolvedValue({ ok: true, value: saved });
    renderWeight();

    // MVP-WGT-001 / ADR-0032: a save onto a date that already holds a
    // weigh-in corrects it, where the old form showed a refused duplicate.
    const panel = await openPanel(user, "Add weigh-in");
    await chooseDay(user, panel, "Tue 1 Sept");
    await user.type(within(panel).getByLabelText("Weight (kg)"), "81.2");
    await runAction(user, panel, "Save weigh-in");

    await waitFor(() =>
      expect(actions.update).toHaveBeenCalledWith({
        id: id(2),
        entryDate: "2026-09-01",
        weightKg: 81.2,
      }),
    );
    expect(actions.create).not.toHaveBeenCalled();
    expect(await findToast("Weigh-in saved.")).toBeInTheDocument();
  });

  it("shows a refusal from the server and keeps the panel open", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({
      ok: false,
      error: {
        code: "validation",
        message: "Check the weigh-in and try again.",
        retryable: false,
      },
    });
    renderWeight();

    const panel = await openPanel(user, "Add weigh-in");
    await user.type(within(panel).getByLabelText("Weight (kg)"), "82.4");
    await runAction(user, panel, "Save weigh-in");

    expect(
      await findToast("Check the weigh-in and try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Add weigh-in" })).toBeVisible();
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it("opens a weigh-in on its own date and value and edits it", async () => {
    const user = userEvent.setup();
    actions.update.mockResolvedValue({ ok: true, value: saved });
    renderWeight();

    const panel = await openPanel(user, "Edit weigh-in Mon 31 Aug");
    expect(panel).toHaveAccessibleName("Edit weigh-in");
    expect(
      within(panel).getByRole("button", { name: "Choose date" }),
    ).toHaveTextContent("Mon 31 Aug");
    const field = within(panel).getByLabelText("Weight (kg)");
    expect(field).toHaveValue("82.5");

    await user.clear(field);
    await user.type(field, "82.7");
    await runAction(user, panel, "Save weigh-in");

    await waitFor(() =>
      expect(actions.update).toHaveBeenCalledWith({
        id: id(1),
        entryDate: "2026-08-31",
        weightKg: 82.7,
      }),
    );
  });

  it("puts back what was changed when the panel is closed unsaved", async () => {
    const user = userEvent.setup();
    renderWeight();

    // Step 20: the panel has no "Unsaved changes" notice; closing it
    // discards the edit, and it reopens on what is saved.
    let panel = await openPanel(user, "Edit weigh-in Tue 1 Sept");
    await user.type(within(panel).getByLabelText("Weight (kg)"), "5");
    expect(within(panel).getByLabelText("Weight (kg)")).toHaveValue("81.55");
    await user.click(within(panel).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    panel = await openPanel(user, "Edit weigh-in Tue 1 Sept");
    expect(within(panel).getByLabelText("Weight (kg)")).toHaveValue("81.5");
    expect(actions.update).not.toHaveBeenCalled();
  });

  it("deletes an existing weigh-in from its Actions", async () => {
    const user = userEvent.setup();
    actions.remove.mockResolvedValue({ ok: true, value: null });
    renderWeight();

    const panel = await openPanel(user, "Edit weigh-in Tue 1 Sept");
    // Step 20: the Actions panel's pick-then-Continue is the confirmation;
    // the prototype's `deleteSheet` does not ask again.
    await runAction(user, panel, "Delete entry");

    await waitFor(() => expect(actions.remove).toHaveBeenCalledWith(id(2)));
    expect(await findToast("Weigh-in deleted.")).toBeInTheDocument();
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
