# ADR-0020: Mobile UI, charting, and quality tooling

- **Status:** Accepted

## Context

The phone-only application needs a consistent visual system, accessible interaction primitives, and responsive progress charts without adopting a desktop-oriented component suite. The implementation also needs a static-check baseline and a future testing toolchain that preserve the project's strict separation between pre-approval static analysis and post-approval feature testing.

Documentation quality is especially important because repository Markdown is the canonical product, architecture, governance, and project-management record. Test commands must remain structurally separate so a normal formatting, lint, type, build, or documentation check cannot accidentally execute prohibited tests.

## Decision

### Styling and UI primitives

Use Tailwind CSS stable `4.x` for application styling. Define application-owned design tokens as CSS custom properties and expose them through the Tailwind theme where useful. Tokens cover at least color, typography, spacing, radii, elevation, motion, and interaction states.

Design only for phone viewports. The base styles are the phone layout; responsive rules may adapt among phone widths and orientations but must not introduce a desktop application layout. Account for safe-area insets, touch target sizing, numeric input behavior, focus visibility, contrast, and reduced-motion preferences.

Build and own the reusable visual layer under `src/shared/ui`. Prefer semantic native HTML where it provides the required behavior. Adopt the stable `radix-ui` package incrementally for complex primitives whose accessibility, focus management, or interaction behavior is difficult to implement correctly, such as dialogs and alert dialogs. Wrap used primitives in application-owned components; application features do not import a third-party visual theme.

Do not adopt a complete styled component kit or CSS-in-JS runtime for the MVP. Exact stable, security-patched Tailwind, Radix, and supporting package versions are selected and locked during implementation initialization.

### Charting

Use Recharts stable `3.x`, with `react-is` aligned to React `19.x` as required by Recharts. Render charts inside feature-owned Client Components and load chart code only on routes that need it.

Application query/domain services calculate ranges, aggregates, PR eligibility, assisted-weight direction, and other product semantics. They return neutral serializable chart series. Chart components handle only presentation, responsive sizing, formatting, interaction, and accessible labeling; Recharts does not become a business-calculation layer.

Charts must fit phone widths without horizontal table scrolling. A chart is never the sole representation of important progress information: provide the accepted textual summary and/or accessible data list alongside it. Respect reduced-motion preferences and do not require hover-only interaction.

### Static checks

Configure these checks as independently runnable npm scripts:

- ESLint CLI with flat configuration, Next.js Core Web Vitals rules, and TypeScript-aware rules;
- Prettier formatting checks, including deterministic Tailwind class ordering;
- strict TypeScript checking with `tsc --noEmit`;
- the Next.js production build;
- `markdownlint-cli2` across repository Markdown;
- Lychee local/offline link validation for internal documentation links.

External-link validation is a separate best-effort static check so network or third-party availability cannot falsely invalidate the mandatory local documentation check. Architecture/dependency-boundary rules should be enforced through ESLint where practical, in addition to Next.js `server-only` enforcement.

Provide one `npm run check` aggregation that runs static checks only. It must not call any unit, component, integration, end-to-end, database-backed, or manual feature test. Static checks remain permitted before commit approval under the accepted governance.

### Future test tooling and gate

When an implementation Task explicitly introduces the relevant test setup, use:

- Vitest for pure domain/application unit tests and server-side integration tests;
- React Testing Library, `user-event`, and DOM matchers for interactive React component behavior;
- the local Supabase/PostgreSQL stack for database and repository integration tests;
- Playwright for end-to-end behavior using phone-only Mobile Safari/WebKit and Mobile Chrome/Chromium projects;
- a real browser IndexedDB implementation in Playwright for active-workout outbox, acknowledgement, reload, retry, and conflict scenarios.

Prefer behavior-focused assertions over large component snapshots. The detailed test plan belongs to the implementing Task and traces to stable MVP criterion IDs.

Test dependencies, configuration, and test source do not authorize execution. Test commands stay separate from `npm run check`, dependency lifecycle scripts, pre-commit hooks, and any automatic workflow that could run before approval. No test command, application run performed to validate behavior, database-backed verification, or manual feature scenario may execute until the user approves the exact Task commit SHA. Any changed SHA invalidates that authorization.

Select and lock the latest stable compatible test-tool versions when their setup Task is implemented. Major tool migrations require an explicit Task and documentation update.

## Consequences

- Tailwind and application-owned tokens support a distinctive phone UI without a third-party visual identity.
- Radix reduces accessibility risk for complex controls while remaining optional and unstyled.
- Recharts provides responsive React-native chart composition, but its client bundle is kept away from routes without charts.
- Separating chart calculations from rendering keeps historical corrections and product rules testable without a browser chart library.
- The static-check command provides broad pre-approval feedback without crossing the test gate.
- Markdown linting and internal-link checking directly protect the repository system of record.
- Mobile browser projects align E2E verification with the product boundary; desktop E2E projects are not required.
- The future toolchain has multiple layers, but each layer has a distinct responsibility and remains dormant until its exact commit is approved for testing.

## Related documents

- [`../architecture/local-technical-architecture.md`](../architecture/local-technical-architecture.md)
- [`../architecture/constraints.md`](../architecture/constraints.md)
- [`../process/development-governance.md`](../process/development-governance.md)
- [`../process/project-management.md`](../process/project-management.md)
- [`../product/history-and-statistics.md`](../product/history-and-statistics.md)
- [`../project/tasks/T-001-define-local-technical-architecture.md`](../project/tasks/T-001-define-local-technical-architecture.md)
- [`0006-approval-gated-feature-testing.md`](0006-approval-gated-feature-testing.md)
- [`0014-commit-approval-and-verification-records.md`](0014-commit-approval-and-verification-records.md)

## Official references

- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS browser compatibility](https://tailwindcss.com/docs/compatibility)
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Recharts responsive sizing](https://recharts.github.io/en-US/guide/sizes/)
- [Next.js ESLint configuration](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Prettier checks](https://prettier.io/docs/next/integrating-with-linters.html)
- [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
- [Lychee](https://github.com/lycheeverse/lychee)
- [Vitest](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright browser and mobile projects](https://playwright.dev/docs/browsers)
