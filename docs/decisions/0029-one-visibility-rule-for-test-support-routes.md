# ADR-0029: One visibility rule for test-support routes

- **Status:** Accepted

## Context

The application carries two routes that exist only to drive browser tests: `/test-support/mobile-ui-foundation` and `/test-support/active-workout-durability`. They originally had different visibility rules and neither rule was written down.

The durability route hid itself in a production build through `notFound()` on `NODE_ENV`, while the mobile-UI-foundation route had no guard. Moving the browser suite onto a production server therefore made one harness unreachable until the inconsistency was found.

A temporary repair used a second development server on port `3101` beside the production server, but that verified the durability harness against a different build. The uniform rule below replaced that asymmetry.

## Decision

Both test-support routes take one rule: they are hidden unless the server was started with `PF_ENABLE_TEST_SUPPORT=1`.

- `NODE_ENV` no longer decides. A production build hides them by default and reveals them when the flag is set, and a development server hides them too unless the flag is set.
- The check lives in one shared helper, `requireTestSupportEnabled`, so a third harness cannot acquire a third rule by omission.
- Both routes are `force-dynamic`, so the flag is read per request and one build cannot bake a permanent not-found into the route.
- The Playwright configuration sets the flag on its own production server. The suite returns to one server and two projects; the development server on `3101` and the `durability-chromium` and `durability-webkit` projects are removed.

## Consequences

- Every browser spec, the durability scenario included, runs against the production build the phone user gets, which is what the suite was moved to a production server for in the first place.
- A default production start still exposes nothing: the flag is absent, so both routes resolve through the not-found boundary exactly as before.
- The rule is explicit and shared, so the next harness inherits it instead of inventing one. The failure this ADR closes was not a wrong rule but an unwritten one.
- Production-access protection remains an open question and is unaffected: this decision governs which routes exist, not who may reach the application.

## Related documents

- [`../architecture/active-workout-durability.md`](../architecture/active-workout-durability.md)
- [`../architecture/mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md)
