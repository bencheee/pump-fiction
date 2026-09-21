"use client";

import { Icon } from "./icon";
import "./search-field.css";

/*
 * The filter field a list puts above itself, ported from the prototype for
 * step 8 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP. It is written twice,
 * byte for byte apart from its placeholder and its label: the History list's
 * exercises tab (lines 302-307) and the Exercise library (lines 906-912,
 * step 16). Its bound values are `hQuery`, `hHasQuery`, `hSearchBorder`,
 * `hQueryChange` and `hClearQuery` (lines 2189-2192).
 *
 * The Add exercise panel's field (step 6) is a different one: 54px, no clear
 * control, and no border that answers what has been typed.
 */
export function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div data-search-field="">
      <input
        type="search"
        autoComplete="off"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-search-filled={value.length > 0 ? "" : undefined}
      />
      <Icon name="search" size={17} />
      {value.length > 0 ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </div>
  );
}
