// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import type { TodaySplit } from "@/features/active-workout/domain/workout";

import { WorkoutPreview } from "./workout-preview";

const navigation = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
const startWorkout = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => navigation }));
vi.mock("@/app/actions/workouts", () => ({ startWorkoutAction: startWorkout }));

const split: TodaySplit = {
  programId: "program",
  programName: "Strength",
  splitId: "split",
  splitName: "Upper Body",
  position: 0,
  averageDurationSeconds: null,
  completedWorkoutCount: 0,
  exercises: [
    {
      exerciseId: "exercise",
      exerciseName: "Pull-Up",
      position: 1,
      plannedSets: 3,
      minReps: 5,
      maxReps: 8,
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("starts the timer boundary only when Start workout is pressed", async () => {
  const user = userEvent.setup();
  startWorkout.mockResolvedValue({ ok: true, value: {} });
  render(<WorkoutPreview split={split} sourceKind="proposed_split" />);

  expect(screen.getByText("00:00")).toBeVisible();
  expect(screen.getByText("Pull-Up")).toBeVisible();
  expect(startWorkout).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Start workout" }));
  expect(startWorkout).toHaveBeenCalledWith(
    expect.objectContaining({
      sourceKind: "proposed_split",
      splitId: "split",
      startedAt: expect.any(String),
    }),
  );
  await waitFor(() =>
    expect(navigation.replace).toHaveBeenCalledWith("/workout/current"),
  );
});

it("keeps the preview open when starting fails", async () => {
  const user = userEvent.setup();
  startWorkout.mockResolvedValue({
    ok: false,
    error: { message: "Try again." },
  });
  render(<WorkoutPreview split={split} sourceKind="alternate_split" />);

  await user.click(screen.getByRole("button", { name: "Start workout" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Try again.");
  expect(navigation.replace).not.toHaveBeenCalled();
});
