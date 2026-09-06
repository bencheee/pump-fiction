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

import type { WeightProgress } from "@/features/history/application/weight-operations";
import type { WeightEntry } from "@/features/history/domain/weight";
import { ToastProvider } from "@/shared/ui";

import { WeightForm } from "./weight-form";
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

// The chart draws the same series the accessible list shows, and Recharts needs
// a laid-out container jsdom does not provide; the browser scenario covers it.
vi.mock("@/features/history/ui/progress-chart", () => ({
  ProgressChart: () => null,
}));

const today = "2026-09-06";
const id = (n: number) =>
  `39000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function progress(overrides: Partial<WeightProgress> = {}): WeightProgress {
  return {
    overview: {
      localDate: today,
      latest: {
        id: id(2),
        entryDate: "2026-09-01",
        weightKg: 81.5,
        changeKg: -1,
      },
      currentWeek: {
        weekStart: "2026-08-31",
        weekEnd: "2026-09-06",
        averageKg: 82,
        recordedDays: 2,
        changeKg: -1,
        provisional: false,
      },
      entries: [
        { id: id(2), entryDate: "2026-09-01", weightKg: 81.5, changeKg: -1 },
        { id: id(1), entryDate: "2026-08-31", weightKg: 82.5, changeKg: null },
      ],
      ...overrides.overview,
    },
    series: {
      metric: "weight",
      label: "Weight",
      unit: "kg",
      lowerIsBetter: false,
      points: [
        { date: "2026-08-31", value: 82.5 },
        { date: "2026-09-01", value: 81.5 },
      ],
      companion: {
        metric: "weekly_average",
        label: "Weekly average",
        unit: "kg",
        lowerIsBetter: false,
        points: [
          {
            date: "2026-09-06",
            value: 82,
            span: {
              start: "2026-08-31",
              end: "2026-09-06",
              recordedDays: 2,
              provisional: false,
            },
          },
        ],
      },
      ...overrides.series,
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

describe("S19 Weight", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows the latest weigh-in, its change, and this week", () => {
    render(<WeightView progress={progress()} initialRange="month" />);

    const latest = card("Latest");
    expect(latest.getByText("81.5 kg")).toBeVisible();
    expect(
      latest.getByText(/−1.0 kg since the previous weigh-in/),
    ).toBeVisible();

    const week = card("This week");
    expect(week.getByText("82.0 kg")).toBeVisible();
    expect(week.getByText(/−1.0 kg vs last week/)).toBeVisible();
    expect(week.getByText(/2\/7 days/)).toBeVisible();
    expect(week.getByText(/Final/)).toBeVisible();
  });

  it("says the weekly change is unavailable rather than zero", () => {
    const view = progress();
    render(
      <WeightView
        progress={{
          ...view,
          overview: {
            ...view.overview,
            currentWeek: { ...view.overview.currentWeek!, changeKg: null },
          },
        }}
        initialRange="month"
      />,
    );
    const week = card("This week");
    expect(week.getByText(/No previous week to compare/)).toBeVisible();
    expect(week.queryByText(/0.0 kg vs last week/)).not.toBeInTheDocument();
  });

  it("marks the current week provisional before its Sunday", () => {
    const view = progress();
    render(
      <WeightView
        progress={{
          ...view,
          overview: {
            ...view.overview,
            currentWeek: { ...view.overview.currentWeek!, provisional: true },
          },
        }}
        initialRange="month"
      />,
    );
    expect(
      card("This week").getByText(/Provisional until Sunday/),
    ).toBeVisible();
  });

  it("lists every weigh-in newest first with its change and edit link", () => {
    render(<WeightView progress={progress()} initialRange="month" />);
    const rows = within(screen.getByRole("list", { name: "Weigh-ins" }));
    const links = rows.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/history/weight/2026-09-01/edit");
    expect(links[0]).toHaveTextContent("81.5 kg");
    expect(links[0]).toHaveTextContent("−1.0 kg");
    expect(links[1]).toHaveTextContent("82.5 kg");
  });

  it("offers the four weight ranges and reloads on a change", async () => {
    const user = userEvent.setup();
    actions.load.mockResolvedValue({ ok: true, value: progress() });
    render(<WeightView progress={progress()} initialRange="month" />);

    const ranges = within(screen.getByRole("group", { name: "Time range" }));
    expect(ranges.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Week",
      "Month",
      "Quarter",
      "Year",
    ]);

    await user.click(ranges.getByRole("button", { name: "Quarter" }));
    expect(actions.load).toHaveBeenCalledWith({ range: "quarter" });
  });

  it("carries the chart in an accessible list, weekly averages included", async () => {
    const user = userEvent.setup();
    render(<WeightView progress={progress()} initialRange="month" />);

    expect(
      screen.getByText(/2 weigh-ins from 82.5 kg to 81.5 kg/),
    ).toBeVisible();

    // The lists sit inside a collapsed disclosure, as they do on S16 and S18.
    await user.click(screen.getByText("Chart values"));
    const values = within(screen.getByRole("list", { name: "Chart values" }));
    expect(values.getAllByRole("listitem")).toHaveLength(2);
    expect(values.getByText("81.5 kg")).toBeVisible();

    const weekly = within(
      screen.getByRole("list", { name: "Weekly averages" }),
    );
    expect(weekly.getByText(/Week of/)).toBeVisible();
    expect(weekly.getByText("82.0 kg")).toBeVisible();
  });

  it("invites the first weigh-in instead of fabricating a zero", () => {
    const view = progress();
    render(
      <WeightView
        progress={{
          ...view,
          overview: {
            localDate: today,
            latest: null,
            currentWeek: null,
            entries: [],
          },
        }}
        initialRange="month"
      />,
    );
    expect(screen.getByText("No weigh-in yet")).toBeVisible();
    expect(screen.queryByText("Latest")).toBeNull();
    expect(screen.queryByRole("group", { name: "Time range" })).toBeNull();
  });
});

describe("S20 weight entry", () => {
  const entry: WeightEntry = {
    id: id(2),
    entryDate: "2026-09-01",
    weightKg: 81.5,
  };

  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("opens a new weigh-in on the local date", () => {
    renderWithToast(<WeightForm localDate={today} />);
    expect(screen.getByLabelText("Date")).toHaveValue(today);
    expect(screen.getByLabelText("Weight (kg)")).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Delete Entry" })).toBeNull();
  });

  it("refuses a future date inline and keeps the entered value", async () => {
    const user = userEvent.setup();
    renderWithToast(<WeightForm localDate={today} />);

    await user.type(screen.getByLabelText("Weight (kg)"), "82.4");
    setDate("2026-09-07");
    await user.click(screen.getByRole("button", { name: "Save Weight" }));

    expect(screen.getByText("Choose today or an earlier date.")).toBeVisible();
    expect(screen.getByLabelText("Weight (kg)")).toHaveValue("82.4");
    expect(actions.create).not.toHaveBeenCalled();
  });

  it("refuses an empty and a non-numeric weight", async () => {
    const user = userEvent.setup();
    renderWithToast(<WeightForm localDate={today} />);

    await user.click(screen.getByRole("button", { name: "Save Weight" }));
    expect(screen.getByText("Enter a weight.")).toBeVisible();

    await user.type(screen.getByLabelText("Weight (kg)"), "eighty");
    await user.click(screen.getByRole("button", { name: "Save Weight" }));
    expect(
      screen.getByText("Enter a number, using a dot for decimals."),
    ).toBeVisible();
    expect(actions.create).not.toHaveBeenCalled();
  });

  it("saves a new weigh-in and returns to Weight", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({ ok: true, value: entry });
    renderWithToast(<WeightForm localDate={today} />);

    await user.type(screen.getByLabelText("Weight (kg)"), "82.4");
    await user.click(screen.getByRole("button", { name: "Save Weight" }));

    expect(actions.create).toHaveBeenCalledWith({
      entryDate: today,
      weightKg: 82.4,
    });
    expect(router.replace).toHaveBeenCalledWith("/history/weight");
    expect(router.refresh).toHaveBeenCalled();
  });

  it("shows a refused duplicate date on the date field", async () => {
    const user = userEvent.setup();
    actions.create.mockResolvedValue({
      ok: false,
      error: {
        code: "validation",
        message: "Check the weigh-in and try again.",
        retryable: false,
        fieldErrors: { entryDate: ["That date already has a weigh-in."] },
      },
    });
    renderWithToast(<WeightForm localDate={today} />);

    await user.type(screen.getByLabelText("Weight (kg)"), "82.4");
    await user.click(screen.getByRole("button", { name: "Save Weight" }));

    expect(screen.getByText("That date already has a weigh-in.")).toBeVisible();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("reports a change only once the form differs from what it opened with", async () => {
    const user = userEvent.setup();
    renderWithToast(<WeightForm entry={entry} localDate={today} />);

    expect(screen.queryByText("Unsaved changes")).toBeNull();
    await user.type(screen.getByLabelText("Weight (kg)"), "5");
    expect(screen.getByText("Unsaved changes")).toBeVisible();
  });

  it("deletes an existing weigh-in behind a confirmation", async () => {
    const user = userEvent.setup();
    actions.remove.mockResolvedValue({ ok: true, value: null });
    renderWithToast(<WeightForm entry={entry} localDate={today} />);

    await user.click(screen.getByRole("button", { name: "Delete Entry" }));
    expect(screen.getByText("Delete this weigh-in?")).toBeVisible();
    expect(actions.remove).not.toHaveBeenCalled();

    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete Entry",
      }),
    );
    expect(actions.remove).toHaveBeenCalledWith(entry.id);
    expect(router.replace).toHaveBeenCalledWith("/history/weight");
  });
});
