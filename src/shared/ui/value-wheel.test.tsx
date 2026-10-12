// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { ValueWheel } from "./value-wheel";

beforeEach(() => vi.stubGlobal("PointerEvent", MouseEvent));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setup() {
  const onChange = vi.fn();
  render(
    <ValueWheel
      kind="reps"
      label="Reps"
      column={[1, 2, 3, 4, 5, 6, 7]}
      value={4}
      fallbackIndex={3}
      unit="reps"
      onChange={onChange}
    />,
  );
  return { wheel: screen.getByRole("group", { name: "Reps" }), onChange };
}

it.each(["cancel", "blur", "visibility"])(
  "discards a drag interrupted by %s",
  (interruption) => {
    const { wheel, onChange } = setup();
    fireEvent.pointerDown(wheel, { clientY: 100 });
    fireEvent.pointerMove(wheel, { clientY: 40 });
    expect(wheel.querySelector("[data-wheel-value]")).toHaveTextContent(
      "6reps",
    );
    if (interruption === "cancel") fireEvent.pointerCancel(wheel);
    else if (interruption === "blur") fireEvent.blur(window);
    else fireEvent(document, new Event("visibilitychange"));
    fireEvent.pointerUp(wheel);
    expect(onChange).not.toHaveBeenCalled();
    expect(wheel.querySelector("[data-wheel-value]")).toHaveTextContent(
      "4reps",
    );
  },
);

it("commits a completed drag once and suppresses its generated click", () => {
  const { wheel, onChange } = setup();
  fireEvent.pointerDown(wheel, { clientY: 100 });
  fireEvent.pointerMove(wheel, { clientY: 40 });
  fireEvent.pointerUp(wheel);
  fireEvent.click(screen.getByRole("button", { name: "5" }));
  expect(onChange.mock.calls).toEqual([[6]]);
  fireEvent.pointerDown(wheel, { clientY: 100 });
  fireEvent.pointerUp(wheel);
  fireEvent.click(screen.getByRole("button", { name: "5" }));
  expect(onChange.mock.calls).toEqual([[6], [5]]);
});
