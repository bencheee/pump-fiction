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
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MeasurementProgress } from "@/features/history/application/body-operations";
import type { MeasurementSummary } from "@/features/history/domain/body";
import { ToastProvider } from "@/shared/ui";

import { AddMeasurementSheet } from "../body-entry-sheet";
import { MeasurementDetailView } from "./[typeId]/measurement-detail-view";
import BodyMeasurementsPage from "./page";

const actions = vi.hoisted(() => ({
  load: vi.fn(),
  createType: vi.fn(),
  renameType: vi.fn(),
  deleteType: vi.fn(),
  createEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
}));

vi.mock("@/app/actions/body", () => ({
  getMeasurementProgressAction: actions.load,
  createMeasurementTypeAction: actions.createType,
  renameMeasurementTypeAction: actions.renameType,
  deleteMeasurementTypeAction: actions.deleteType,
  createMeasurementEntryAction: actions.createEntry,
  updateMeasurementEntryAction: actions.updateEntry,
  deleteMeasurementEntryAction: actions.deleteEntry,
}));

// The weigh-in actions are imported by the shared Body entry panel.
vi.mock("@/app/actions/weight", () => ({
  createWeightEntryAction: vi.fn(),
  updateWeightEntryAction: vi.fn(),
  deleteWeightEntryAction: vi.fn(),
}));

const server = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("@/server/application/body", () => ({
  listBodyMeasurements: server.list,
}));

const router = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

// 6 September 2026; the entries below are a month apart.
const today = "2026-09-06";
const typeId = "42000000-0000-4000-8000-0000000000a0";
const id = (n: number) =>
  `42000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const waist: MeasurementSummary = {
  id: typeId,
  name: "Waist",
  unit: "cm",
  latest: {
    id: id(3),
    entryDate: "2026-08-01",
    valueCm: 84,
    changeCm: -0.5,
  },
  entryCount: 3,
  deletable: false,
};

const chest: MeasurementSummary = {
  id: "42000000-0000-4000-8000-0000000000b0",
  name: "Chest",
  unit: "cm",
  latest: null,
  entryCount: 0,
  deletable: true,
};

function progress(
  overrides: Partial<MeasurementProgress["detail"]> = {},
): MeasurementProgress {
  return {
    localDate: today,
    detail: {
      type: { id: typeId, name: "Waist", unit: "cm" },
      latest: {
        id: id(3),
        entryDate: "2026-08-01",
        valueCm: 84,
        changeCm: -0.5,
      },
      totalChangeCm: -1,
      entries: [
        { id: id(3), entryDate: "2026-08-01", valueCm: 84, changeCm: -0.5 },
        { id: id(2), entryDate: "2026-07-01", valueCm: 84.5, changeCm: -0.5 },
        { id: id(1), entryDate: "2026-06-01", valueCm: 85, changeCm: null },
      ],
      ...overrides,
    },
    // The view computes its own series per range; this one is unused.
    series: {
      metric: "measurement",
      label: "Measurement",
      unit: "cm",
      lowerIsBetter: false,
      points: [],
    },
  };
}

function withToast(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

function renderDetail(value: MeasurementProgress = progress()) {
  return withToast(<MeasurementDetailView progress={value} />);
}

/** The latest card: its label, value and detail line. */
function latestCard() {
  const card = document.querySelector<HTMLElement>("[data-measurement-latest]");
  if (!card) throw new Error("No latest card");
  return card;
}

function bars() {
  return [
    ...document.querySelectorAll<HTMLButtonElement>(
      "[data-bar-chart-bars] button",
    ),
  ];
}

function chartSummary() {
  return document.querySelector("[data-bar-chart-summary]");
}

/** The toast is outside the modal panel, which hides it from role queries. */
function findToast(message: string) {
  return screen.findByText(message, { selector: "[data-toast-message]" });
}

async function openPanel(user: UserEvent, trigger: string, title: string) {
  await user.click(screen.getByRole("button", { name: trigger }));
  return screen.findByRole("dialog", { name: title });
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

describe("S21 measurements", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("lists every measurement with its latest value and change", async () => {
    server.list.mockResolvedValue({
      ok: true,
      value: { localDate: today, measurements: [chest, waist] },
    });
    withToast(await BodyMeasurementsPage());

    expect(screen.getByText("2 measurements")).toBeVisible();
    const rows = screen.getAllByRole("link");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("href", `/body/measurements/${chest.id}`);
    expect(rows[0]).toHaveTextContent("Chest");
    expect(rows[0]).toHaveTextContent("No measurement recorded yet");
    expect(rows[1]).toHaveAttribute("href", `/body/measurements/${typeId}`);
    expect(rows[1]).toHaveTextContent("Waist84 cm · Sat 1 Aug · −0.5 cm");
    // MVP-BOD-003: a direction is never labelled good or bad.
    expect(
      screen.getByText(/A rise or a fall is neither good nor bad on its own/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Add measurement" }),
    ).toBeVisible();
  });

  it("names the first measurement's missing change instead of a zero", async () => {
    server.list.mockResolvedValue({
      ok: true,
      value: {
        localDate: today,
        measurements: [
          {
            ...waist,
            latest: { ...waist.latest!, changeCm: null },
            entryCount: 1,
          },
        ],
      },
    });
    withToast(await BodyMeasurementsPage());

    expect(screen.getByText("1 measurement")).toBeVisible();
    expect(screen.getByRole("link")).toHaveTextContent(
      "84 cm · Sat 1 Aug · First measurement",
    );
  });

  it("invites the first measurement when there is none", async () => {
    server.list.mockResolvedValue({
      ok: true,
      value: { localDate: today, measurements: [] },
    });
    withToast(await BodyMeasurementsPage());

    expect(screen.getByText("0 measurements")).toBeVisible();
    expect(screen.getByText("No measurements yet")).toBeVisible();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("says why the list could not be read and offers another try", async () => {
    server.list.mockResolvedValue({
      ok: false,
      error: {
        code: "persistence",
        message: "We couldn't load your measurements.",
        retryable: true,
      },
    });
    withToast(await BodyMeasurementsPage());

    expect(
      screen.getByText(/We couldn't load your measurements\./),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/body/measurements",
    );
  });
});

describe("S22 measurement type", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("creates a type and stays on Body", async () => {
    const user = userEvent.setup();
    actions.createType.mockResolvedValue({
      ok: true,
      value: { id: typeId, name: "Waist", unit: "cm" },
    });
    withToast(<AddMeasurementSheet localDate={today} />);

    const panel = await openPanel(user, "Add measurement", "Add measurement");
    // ADR-0030 removed the unit block; the unit is a label under the name.
    expect(within(panel).getByText("Recorded in centimetres.")).toBeVisible();
    // A measurement has no date of its own.
    expect(
      within(panel).queryByRole("button", { name: "Choose date" }),
    ).toBeNull();
    expect(await actionLabels(user, panel)).toEqual(["Add measurement"]);
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Actions" })).toBeNull(),
    );

    await user.type(within(panel).getByLabelText("Measurement name"), "Waist");
    await runAction(user, panel, "Add measurement");

    await waitFor(() =>
      expect(actions.createType).toHaveBeenCalledWith({ name: "Waist" }),
    );
    expect(await findToast("Measurement added.")).toBeInTheDocument();
    // Step 20: the panel closes over the tab and refreshes it, where the old
    // form route navigated back to /body/measurements.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(router.refresh).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("refuses a blank name without calling the server", async () => {
    const user = userEvent.setup();
    withToast(<AddMeasurementSheet localDate={today} />);

    const panel = await openPanel(user, "Add measurement", "Add measurement");
    await user.type(within(panel).getByLabelText("Measurement name"), "   ");
    await runAction(user, panel, "Add measurement");

    // Step 20 takes the prototype's refusal, `Enter a measurement name.`
    expect(await findToast("Enter a measurement name.")).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Add measurement" }),
    ).toBeVisible();
    expect(actions.createType).not.toHaveBeenCalled();
  });

  it("keeps the panel open when the server refuses the name", async () => {
    const user = userEvent.setup();
    actions.createType.mockResolvedValue({
      ok: false,
      error: {
        code: "validation",
        message: "Check the measurement and try again.",
        retryable: false,
        fieldErrors: { name: ["Another measurement already uses this name."] },
      },
    });
    withToast(<AddMeasurementSheet localDate={today} />);

    const panel = await openPanel(user, "Add measurement", "Add measurement");
    await user.type(within(panel).getByLabelText("Measurement name"), "Waist");
    await runAction(user, panel, "Add measurement");

    expect(
      await findToast("Another measurement already uses this name."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Add measurement" }),
    ).toBeVisible();
    expect(router.refresh).not.toHaveBeenCalled();
  });

  // A refusal's field reason is the one the toast gives, not its generic
  // message.
  it("says a refused name is already in use", async () => {
    const user = userEvent.setup();
    actions.createType.mockResolvedValue({
      ok: false,
      error: {
        code: "validation",
        message: "Check the measurement and try again.",
        retryable: false,
        fieldErrors: { name: ["Another measurement already uses this name."] },
      },
    });
    withToast(<AddMeasurementSheet localDate={today} />);

    const panel = await openPanel(user, "Add measurement", "Add measurement");
    await user.type(within(panel).getByLabelText("Measurement name"), "Waist");
    await runAction(user, panel, "Add measurement");

    await waitFor(() => expect(actions.createType).toHaveBeenCalled());
    expect(
      await findToast("Another measurement already uses this name."),
    ).toBeInTheDocument();
  });

  it("renames from the measurement's pencil without touching its entries", async () => {
    const user = userEvent.setup();
    actions.renameType.mockResolvedValue({
      ok: true,
      value: { id: typeId, name: "Waist at navel", unit: "cm" },
    });
    renderDetail();

    const panel = await openPanel(user, "Edit measurement", "Edit measurement");
    const name = within(panel).getByLabelText("Measurement name");
    expect(name).toHaveValue("Waist");
    // ADR-0024 removed archiving; nothing offers it.
    expect(within(panel).queryByText(/Archive/i)).toBeNull();
    expect(await actionLabels(user, panel)).toEqual([
      "Save changes",
      "Delete measurement",
    ]);
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Actions" })).toBeNull(),
    );

    await user.type(name, " at navel");
    await runAction(user, panel, "Save changes");

    await waitFor(() =>
      expect(actions.renameType).toHaveBeenCalledWith({
        id: typeId,
        name: "Waist at navel",
      }),
    );
    expect(await findToast("Measurement renamed.")).toBeInTheDocument();
    expect(actions.deleteEntry).not.toHaveBeenCalled();
    expect(actions.updateEntry).not.toHaveBeenCalled();
  });

  it("explains a refused deletion while entries exist and stays", async () => {
    const user = userEvent.setup();
    const reason =
      "This measurement has entries, and they are its only record. Delete them first if you really want it gone.";
    actions.deleteType.mockResolvedValue({
      ok: false,
      error: { code: "conflict", message: reason, retryable: false },
    });
    renderDetail();

    // Step 20: the panel offers the deletion and the server refuses it with
    // MVP-BOD-001's reason, where the old form hid the control.
    const panel = await openPanel(user, "Edit measurement", "Edit measurement");
    await runAction(user, panel, "Delete measurement");

    await waitFor(() =>
      expect(actions.deleteType).toHaveBeenCalledWith(typeId),
    );
    expect(await findToast(reason)).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Edit measurement" }),
    ).toBeVisible();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("deletes an empty type and returns to the list", async () => {
    const user = userEvent.setup();
    actions.deleteType.mockResolvedValue({ ok: true, value: null });
    renderDetail(progress({ latest: null, totalChangeCm: null, entries: [] }));

    // Step 20: the Actions panel's pick-then-Continue is the confirmation;
    // the prototype's `deleteSheet` does not ask again.
    const panel = await openPanel(user, "Edit measurement", "Edit measurement");
    await runAction(user, panel, "Delete measurement");

    await waitFor(() =>
      expect(actions.deleteType).toHaveBeenCalledWith(typeId),
    );
    expect(await findToast("Measurement deleted.")).toBeInTheDocument();
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/body/measurements"),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("S23 measurement detail", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows the latest value with its change since the previous and the first", () => {
    renderDetail();

    // Step 19: the prototype's one latest card states both changes in its
    // detail line, where the old screen drew three cards.
    const card = within(latestCard());
    expect(card.getByText("Latest")).toBeVisible();
    expect(card.getByText("84 cm")).toBeVisible();
    expect(
      card.getByText(
        "Sat 1 Aug · −0.5 cm since the previous entry · −1.0 cm since the first",
      ),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/body/measurements",
    );
  });

  it("does not repeat the change since the first with two entries", () => {
    renderDetail(
      progress({
        entries: progress().detail.entries.slice(0, 2),
        totalChangeCm: -0.5,
      }),
    );
    expect(latestCard()).toHaveTextContent(
      /^Latest84 cmSat 1 Aug · −0.5 cm since the previous entry$/,
    );
  });

  it("leaves both changes unstated with a single entry", () => {
    renderDetail(
      progress({
        latest: {
          id: id(1),
          entryDate: "2026-06-01",
          valueCm: 85,
          changeCm: null,
        },
        totalChangeCm: null,
        entries: [
          { id: id(1), entryDate: "2026-06-01", valueCm: 85, changeCm: null },
        ],
      }),
    );

    // Step 19: the prototype's latest card says nothing where there is no
    // change, where the old cards said `First measurement` and
    // `Needs a second measurement`. Either way, no zero is fabricated.
    expect(latestCard()).toHaveTextContent(/^Latest85 cmMon 1 Jun$/);
    expect(screen.queryByText(/0\.0 cm/)).toBeNull();
  });

  it("invites the first entry instead of fabricating a zero", () => {
    renderDetail(progress({ latest: null, totalChangeCm: null, entries: [] }));

    // Step 19: the latest card stays and states no value.
    expect(latestCard()).toHaveTextContent(/^Latest—Nothing recorded yet$/);
    expect(screen.getByText(/Record the first entry/)).toBeVisible();
    expect(screen.getByText("No entry falls inside this range.")).toBeVisible();
    expect(screen.queryByRole("button", { name: /^Edit entry/ })).toBeNull();
    expect(screen.queryByText(/0\.0 cm/)).toBeNull();
  });

  it("offers the four body ranges, opens on the quarter, and redraws in place", async () => {
    const user = userEvent.setup();
    renderDetail();

    // Owner decision 5 after step 21: the prototype's week to year, opening
    // on the quarter, where the old screen offered month to all.
    const ranges = within(screen.getByRole("group", { name: "Time range" }));
    expect(ranges.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Week",
      "Month",
      "Quarter",
      "Year",
    ]);
    expect(ranges.getByRole("button", { name: "Quarter" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // The quarter from 6 June holds July and August.
    expect(bars().map((bar) => bar.getAttribute("aria-label"))).toEqual([
      "Wed 1 Jul · 84.5 cm",
      "Sat 1 Aug · 84 cm",
    ]);

    // Step 19: the chips answer from the entries already on the screen,
    // where they used to reload the series through a server action.
    await user.click(ranges.getByRole("button", { name: "Year" }));
    expect(bars()).toHaveLength(3);

    await user.click(ranges.getByRole("button", { name: "Month" }));
    expect(bars()).toHaveLength(0);
    expect(screen.getByText("No entry falls inside this range.")).toBeVisible();
    expect(actions.load).not.toHaveBeenCalled();
  });

  it("carries the chart in a sentence and the entries beneath it", () => {
    renderDetail();

    expect(chartSummary()).toHaveTextContent(
      "2 entries in range: 84.5 cm to 84 cm, lowest 84 cm, highest 84.5 cm.",
    );
    // Step 19 / ADR-0033: the measure card draws no values list; the entry
    // list under it states every value the bars draw.
    expect(screen.queryByRole("button", { name: "Chart values" })).toBeNull();
    const reading = document.querySelector("[data-bar-chart-reading]");
    expect(reading).toHaveTextContent("Sat 1 Aug84 cm");
  });

  it("moves the reading to a pressed bar", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(bars()[0]);
    expect(
      document.querySelector("[data-bar-chart-reading]"),
    ).toHaveTextContent("Wed 1 Jul84.5 cm");
  });

  it("lists every entry newest first with its change and edit control", () => {
    renderDetail();
    // Step 20: an entry opens in the Body entry panel, where it used to link
    // to the deleted /body/measurements/[typeId]/[date]/edit route.
    const rows = screen.getAllByRole("button", { name: /^Edit entry / });
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveAccessibleName("Edit entry Sat 1 Aug");
    expect(rows[0]).toHaveTextContent(/^84 cmSat 1 Aug · −0.5 cm$/);
    expect(rows[1]).toHaveTextContent(/^84.5 cmWed 1 Jul · −0.5 cm$/);
    // Step 19: the first entry states no change, rather than
    // `First measurement`.
    expect(rows[2]).toHaveTextContent(/^85 cmMon 1 Jun$/);
  });
});

describe("S24 measurement entry", () => {
  const saved = { id: id(9), entryDate: today, valueCm: 84.2 };

  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("opens a new entry on the local date", async () => {
    const user = userEvent.setup();
    renderDetail();

    const panel = await openPanel(
      user,
      "Record measurement",
      "Record measurement",
    );
    expect(
      within(panel).getByRole("button", { name: "Choose date" }),
    ).toHaveTextContent("Sun 6 Sept");
    expect(within(panel).getByLabelText("Measurement (cm)")).toHaveValue("");
    expect(await actionLabels(user, panel)).toEqual(["Save entry"]);
  });

  it("opens today's entry when today already holds one", async () => {
    const user = userEvent.setup();
    const todays = {
      id: id(4),
      entryDate: today,
      valueCm: 83.8,
      changeCm: -0.2,
    };
    renderDetail(
      progress({
        latest: todays,
        entries: [todays, ...progress().detail.entries],
      }),
    );

    await user.click(
      screen.getByRole("button", { name: "Record measurement" }),
    );
    const panel = await screen.findByRole("dialog", { name: "Edit entry" });
    expect(within(panel).getByLabelText("Measurement (cm)")).toHaveValue(
      "83.8",
    );
    expect(await actionLabels(user, panel)).toEqual([
      "Save entry",
      "Delete entry",
    ]);
  });

  it("offers no future date and refuses an empty value", async () => {
    const user = userEvent.setup();
    renderDetail();

    const panel = await openPanel(
      user,
      "Record measurement",
      "Record measurement",
    );
    await runAction(user, panel, "Save entry");
    // Step 20 takes the prototype's refusal, `Enter a number.`
    expect(await findToast("Enter a number.")).toBeInTheDocument();
    expect(actions.createEntry).not.toHaveBeenCalled();

    // Step 20: the date picker replaces the date input, so a future date is
    // refused by being unreachable rather than by an inline message.
    await user.click(
      within(panel).getByRole("button", { name: "Choose date" }),
    );
    const picker = within(
      await screen.findByRole("dialog", { name: "Choose date" }),
    );
    expect(picker.getByRole("button", { name: "Sun 6 Sept" })).toBeEnabled();
    expect(picker.getByRole("button", { name: "Mon 7 Sept" })).toBeDisabled();
    expect(picker.getByRole("button", { name: "Next month" })).toBeDisabled();
  });

  it("saves a new entry against its own type", async () => {
    const user = userEvent.setup();
    actions.createEntry.mockResolvedValue({ ok: true, value: saved });
    renderDetail();

    const panel = await openPanel(
      user,
      "Record measurement",
      "Record measurement",
    );
    await user.type(within(panel).getByLabelText("Measurement (cm)"), "84,2");
    await runAction(user, panel, "Save entry");

    await waitFor(() =>
      expect(actions.createEntry).toHaveBeenCalledWith({
        measurementTypeId: typeId,
        entryDate: today,
        valueCm: 84.2,
      }),
    );
    expect(await findToast("Measurement saved.")).toBeInTheDocument();
    // Step 20: the panel closes over the measurement and refreshes it.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(router.refresh).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("records an entry for an earlier date", async () => {
    const user = userEvent.setup();
    actions.createEntry.mockResolvedValue({ ok: true, value: saved });
    renderDetail();

    const panel = await openPanel(
      user,
      "Record measurement",
      "Record measurement",
    );
    await chooseDay(user, panel, "Sat 15 Aug");
    await user.type(within(panel).getByLabelText("Measurement (cm)"), "84.1");
    await runAction(user, panel, "Save entry");

    await waitFor(() =>
      expect(actions.createEntry).toHaveBeenCalledWith({
        measurementTypeId: typeId,
        entryDate: "2026-08-15",
        valueCm: 84.1,
      }),
    );
  });

  it("corrects the entry a chosen date already holds", async () => {
    const user = userEvent.setup();
    actions.updateEntry.mockResolvedValue({ ok: true, value: saved });
    renderDetail();

    // MVP-BOD-002 / ADR-0032: a save onto a date that already holds a value
    // corrects it, where the old form showed a refused duplicate.
    const panel = await openPanel(
      user,
      "Record measurement",
      "Record measurement",
    );
    await chooseDay(user, panel, "Sat 1 Aug");
    await user.type(within(panel).getByLabelText("Measurement (cm)"), "83.9");
    await runAction(user, panel, "Save entry");

    await waitFor(() =>
      expect(actions.updateEntry).toHaveBeenCalledWith({
        id: id(3),
        entryDate: "2026-08-01",
        valueCm: 83.9,
      }),
    );
    expect(actions.createEntry).not.toHaveBeenCalled();
  });

  it("opens an entry on its own date and value and edits it", async () => {
    const user = userEvent.setup();
    actions.updateEntry.mockResolvedValue({ ok: true, value: saved });
    renderDetail();

    const panel = await openPanel(user, "Edit entry Wed 1 Jul", "Edit entry");
    expect(
      within(panel).getByRole("button", { name: "Choose date" }),
    ).toHaveTextContent("Wed 1 Jul");
    const field = within(panel).getByLabelText("Measurement (cm)");
    expect(field).toHaveValue("84.5");

    await user.clear(field);
    await user.type(field, "84.4");
    await runAction(user, panel, "Save entry");

    await waitFor(() =>
      expect(actions.updateEntry).toHaveBeenCalledWith({
        id: id(2),
        entryDate: "2026-07-01",
        valueCm: 84.4,
      }),
    );
  });

  it("deletes an existing entry from its Actions", async () => {
    const user = userEvent.setup();
    actions.deleteEntry.mockResolvedValue({ ok: true, value: null });
    renderDetail();

    // Step 20: the Actions panel's pick-then-Continue is the confirmation;
    // the prototype's `deleteSheet` does not ask again.
    const panel = await openPanel(user, "Edit entry Sat 1 Aug", "Edit entry");
    await runAction(user, panel, "Delete entry");

    await waitFor(() =>
      expect(actions.deleteEntry).toHaveBeenCalledWith(id(3)),
    );
    expect(await findToast("Entry deleted.")).toBeInTheDocument();
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
