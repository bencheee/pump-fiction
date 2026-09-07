// A phone set to a Croatian locale offers a comma on its decimal keyboard, so
// both separators reach every decimal field. They all normalize the typed text
// the same way before `Number` sees it; what the resulting number must then be
// stays each screen's own rule.
//
// Only the first comma is replaced, so a value carrying more than one separator
// stays unparseable rather than being guessed at: "1,2,3" and "1.234,5" are
// still refused, as they were before.
export function normalizeDecimalInput(text: string): string {
  return text.trim().replace(",", ".");
}
