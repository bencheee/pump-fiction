// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MeasurementProgress } from "@/features/history/application/body-operations";
import type { MeasurementSummary } from "@/features/history/domain/body";
import { ToastProvider } from "@/shared/ui";

import { MeasurementDetailView } from "./[typeId]/measurement-detail-view";
import { MeasurementEntryForm } from "./measurement-entry-form";
import { MeasurementTypeForm } from "./measurement-type-form";

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

const router = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

// The chart draws the same series the accessible list shows, and Recharts needs
// a laid-out container jsdom does not provide; the browser scenario covers it.
vi.mock("@/features/history/ui/progress-chart", () => ({
  ProgressChart: () => null,
}));

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

const emptyType: MeasurementSummary = {
  id: typeId,
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
    series: {
      metric: "measurement",
      label: "Measurement",
      unit: "cm",
      lowerIsBetter: false,
      points: [
        { date: "2026-06-01", value: 85 },
        { date: "2026-07-01", value: 84.5 },
        { date: "2026-08-01", value: 84 },
      ],
    },
  };
}

/** A StatCard is a section with a heading, not a named region. */
function card(label: string) {
  const section = screen.getByText(label).closest("section");
  if (!section) throw new Error(`No card for ${label}`);
  return within(section);
}

/** A date input is set rather than typed into; jsdom has no date picker. */
function setDate(value: string) {
  fireEvent.change(screen.getByLabelText("Date"), { target: { value } });
}

function renderWithToast(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("S22 measurement type", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("creates a type and returns to Body", async () => {
    const user = userEvent.setup();
    actions.createType.mockResolvedValue({
      ok: true,
      value: { id: typeId, name: "Waist", unit: "cm" },
    });
    renderWithToast(<MeasurementTypeForm />);

    expect(screen.getByText("cm")).toBeVisible();
    await user.type(screen.getByLabelText("Name"), "Waist");
    await user.click(screen.getByRole("button", { name: "Save Measurement" }));

    expect(actions.createType).toHaveBeenCalledWith({ name: "Waist" });
    expect(router.replace).toHaveBeenCalledWith("/history/body");
  });

  it("refuses a blank name without calling the server", async () => {
    const user = userEvent.setup();
    renderWithToast(<MeasurementTypeForm />);

    await user.click(screen.getByRole("button", { name: "Save Measurement" }));
    expect(screen.getByText("Enter a name.")).toBeVisible();
    expect(actions.createType).not.toHaveBeenCalled();
  });

  it("shows a refused duplicate name on the name field", async () => {
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
    renderWithToast(<MeasurementTypeForm />);

    await user.type(screen.getByLabelText("Name"), "Waist");
    await user.click(screen.getByRole("button", { name: "Save Measurement" }));

    expect(
      screen.getByText("Another measurement already uses this name."),
    ).toBeVisible();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("explains instead of offering deletion while entries exist", () => {
    renderWithToast(<MeasurementTypeForm measurement={waist} />);

    expect(screen.getByText("3 measurements recorded")).toBeVisible();
    expect(screen.getByText(/only record of this measurement/)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Delete Measurement" }),
    ).toBeNull();
    // ADR-0024 removed archiving; nothing offers it.
    expect(screen.queryByText(/Archive/i)).toBeNull();
  });

  it("deletes an empty type behind a confirmation", async () => {
    const user = userEvent.setup();
    actions.deleteType.mockResolvedValue({ ok: true, value: null });
    renderWithToast(<MeasurementTypeForm measurement={emptyType} />);

    await user.click(
      screen.getByRole("button", { name: "Delete Measurement" }),
    );
    expect(screen.getByText("Delete this measurement?")).toBeVisible();
    expect(actions.deleteType).not.toHaveBeenCalled();

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete Measurement",
      }),
    );
    expect(actions.deleteType).toHaveBeenCalledWith(typeId);
  });

  it("renames without touching what is recorded", async () => {
    const user = userEvent.setup();
    actions.renameType.mockResolvedValue({
      ok: true,
      value: { id: typeId, name: "Waist at navel", unit: "cm" },
    });
    renderWithToast(<MeasurementTypeForm measurement={waist} />);

    await user.type(screen.getByLabelText("Name"), " at navel");
    await user.click(screen.getByRole("button", { name: "Save Measurement" }));

    expect(actions.renameType).toHaveBeenCalledWith({
      id: typeId,
      name: "Waist at navel",
    });
  });
});

describe("S23 measurement detail", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows the latest value and both changes", () => {
    render(<MeasurementDetailView progress={progress()} initialRange="all" />);

    expect(card("Latest").getByText("84 cm")).toBeVisible();
    expect(card("Latest change").getByText("−0.5 cm")).toBeVisible();
    expect(card("Total change").getByText("−1.0 cm")).toBeVisible();
  });

  it("leaves both changes unavailable with a single entry", () => {
    render(
      <MeasurementDetailView
        progress={progress({
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
        })}
        initialRange="all"
      />,
    );

    expect(card("Latest change").getByText("First measurement")).toBeVisible();
    expect(
      card("Total change").getByText("Needs a second measurement"),
    ).toBeVisible();
    expect(screen.queryByText("0.0 cm")).toBeNull();
  });

  it("invites the first entry instead of fabricating a zero", () => {
    render(
      <MeasurementDetailView
        progress={progress({ latest: null, totalChangeCm: null, entries: [] })}
        initialRange="all"
      />,
    );
    expect(screen.getByText("Nothing recorded yet")).toBeVisible();
    expect(screen.queryByText("Latest")).toBeNull();
  });

  it("offers the four body ranges and reloads on a change", async () => {
    const user = userEvent.setup();
    actions.load.mockResolvedValue({ ok: true, value: progress() });
    render(<MeasurementDetailView progress={progress()} initialRange="all" />);

    const ranges = within(screen.getByRole("group", { name: "Time range" }));
    expect(ranges.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Month",
      "Quarter",
      "Year",
      "All",
    ]);

    await user.click(ranges.getByRole("button", { name: "Quarter" }));
    expect(actions.load).toHaveBeenCalledWith(typeId, { range: "quarter" });
  });

  it("carries the chart in an accessible list beside a sentence", async () => {
    const user = userEvent.setup();
    render(<MeasurementDetailView progress={progress()} initialRange="all" />);

    expect(
      screen.getByText(/3 entries from 85 cm to 84 cm, lowest 84 cm/),
    ).toBeVisible();

    // The list sits inside a collapsed disclosure, as it does on S16 and S19.
    await user.click(screen.getByText("Chart values"));
    const values = within(screen.getByRole("list", { name: "Chart values" }));
    expect(values.getAllByRole("listitem")).toHaveLength(3);
    expect(values.getByText("84.5 cm")).toBeVisible();
  });

  it("lists every entry newest first with its change and edit link", () => {
    render(<MeasurementDetailView progress={progress()} initialRange="all" />);
    const links = within(
      screen.getByRole("list", { name: "Entries" }),
    ).getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute(
      "href",
      `/history/body/${typeId}/2026-08-01/edit`,
    );
    expect(links[0]).toHaveTextContent("84 cm");
    expect(links.at(-1)).toHaveTextContent("First measurement");
  });
});

describe("S24 measurement entry", () => {
  const type = { id: typeId, name: "Waist", unit: "cm" } as const;
  const entry = { id: id(3), entryDate: "2026-08-01", valueCm: 84 };

  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("opens a new entry on the local date", () => {
    renderWithToast(<MeasurementEntryForm type={type} localDate={today} />);
    expect(screen.getByLabelText("Date")).toHaveValue(today);
    expect(screen.getByLabelText("Measurement (cm)")).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Delete Entry" })).toBeNull();
  });

  it("refuses a future date and an empty value inline", async () => {
    const user = userEvent.setup();
    renderWithToast(<MeasurementEntryForm type={type} localDate={today} />);

    await user.click(screen.getByRole("button", { name: "Save Entry" }));
    expect(screen.getByText("Enter a measurement.")).toBeVisible();

    await user.type(screen.getByLabelText("Measurement (cm)"), "84.2");
    setDate("2026-09-07");
    await user.click(screen.getByRole("button", { name: "Save Entry" }));
    expect(screen.getByText("Choose today or an earlier date.")).toBeVisible();
    expect(screen.getByLabelText("Measurement (cm)")).toHaveValue("84.2");
    expect(actions.createEntry).not.toHaveBeenCalled();
  });

  it("saves a new entry against its own type", async () => {
    const user = userEvent.setup();
    actions.createEntry.mockResolvedValue({ ok: true, value: entry });
    renderWithToast(<MeasurementEntryForm type={type} localDate={today} />);

    await user.type(screen.getByLabelText("Measurement (cm)"), "84.2");
    await user.click(screen.getByRole("button", { name: "Save Entry" }));

    expect(actions.createEntry).toHaveBeenCalledWith({
      measurementTypeId: typeId,
      entryDate: today,
      valueCm: 84.2,
    });
    expect(router.replace).toHaveBeenCalledWith(`/history/body/${typeId}`);
  });

  it("shows a refused duplicate date on the date field", async () => {
    const user = userEvent.setup();
    actions.createEntry.mockResolvedValue({
      ok: false,
      error: {
        code: "validation",
        message: "Check the measurement and try again.",
        retryable: false,
        fieldErrors: { entryDate: ["That date already has a measurement."] },
      },
    });
    renderWithToast(<MeasurementEntryForm type={type} localDate={today} />);

    await user.type(screen.getByLabelText("Measurement (cm)"), "84.2");
    await user.click(screen.getByRole("button", { name: "Save Entry" }));

    expect(
      screen.getByText("That date already has a measurement."),
    ).toBeVisible();
  });

  it("deletes an existing entry behind a confirmation", async () => {
    const user = userEvent.setup();
    actions.deleteEntry.mockResolvedValue({ ok: true, value: null });
    renderWithToast(
      <MeasurementEntryForm type={type} entry={entry} localDate={today} />,
    );

    expect(screen.queryByText("Unsaved changes")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Delete Entry" }));
    expect(screen.getByText("Delete this entry?")).toBeVisible();

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete Entry",
      }),
    );
    expect(actions.deleteEntry).toHaveBeenCalledWith(entry.id);
    expect(router.replace).toHaveBeenCalledWith(`/history/body/${typeId}`);
  });
});
