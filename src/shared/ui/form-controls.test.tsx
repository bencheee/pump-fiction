// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NumericField, TextField } from "./form-controls";

describe("shared form controls", () => {
  it("connects a validation alert and persistent hint to its field", () => {
    render(
      <TextField
        id="entry-date"
        label="Date"
        hint="Use a local calendar date."
        error="Choose a valid date."
      />,
    );

    const field = screen.getByLabelText("Date");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(
      "Choose a valid date. Use a local calendar date.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a valid date.");
  });

  it("requests a phone numeric keyboard without changing the value contract", () => {
    render(<NumericField id="weight" label="Weight" />);
    expect(screen.getByLabelText("Weight")).toHaveAttribute(
      "inputmode",
      "decimal",
    );
  });
});
