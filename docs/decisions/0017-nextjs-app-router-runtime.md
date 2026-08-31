# ADR-0017: Next.js App Router runtime

- **Status:** Accepted

## Context

The local MVP needs a mature React framework for a highly interactive phone UI, while preserving a direct path to the anticipated Vercel deployment and future Supabase integration. The runtime policy must use supported versions without locking the project to a patch that may already have a security replacement when implementation begins.

## Decision

Use:

- Next.js `16.x` Active LTS;
- App Router;
- React `19.x` as supported by the selected Next.js release, without independently pinning React canary builds;
- TypeScript with strict type checking;
- Node.js `24.x` LTS.

At framework initialization, select and lock the latest security-patched stable Next.js `16.x`, React `19.x`, and Node.js `24.x` releases compatible with one another. Commit the dependency lockfile. Do not automatically adopt major versions; each major upgrade requires its own Task, review of official migration/security guidance, and documentation update.

Interactive workout flows may use Client Components inside the App Router. This decision does not yet select component boundaries, data fetching, persistence, package manager, or deployment configuration.

## Consequences

- The project uses the current supported Next.js major and a current Node LTS runtime.
- App Router provides both client-side application behavior and optional server capabilities without requiring a later framework migration.
- The anticipated Vercel direction has first-class Next.js support, and Supabase maintains official Next.js integration guidance.
- Exact patch versions remain safe to choose at initialization time rather than becoming stale in a documentation-only phase.
- Next.js caching and Server/Client Component boundaries must be made explicit in the later application-structure decision.

## Subsequent refinement

[ADR-0019](0019-application-boundaries-and-active-workout-durability.md) accepts the package manager, repository structure, Server/Client boundaries, mutation adapters, and active-workout durability model that this ADR intentionally left open.

The accepted external-design handoff resolves the remaining route conventions: application URLs use no trailing slash; persisted entity parameters are opaque UUID strings rather than editable-name slugs; malformed or unavailable identifiers use the shared App Router not-found boundary; sheets and dialogs remain transient parent-route state whose history entry dismisses before parent navigation.

## Related documents

- [`../architecture/local-technical-architecture.md`](../architecture/local-technical-architecture.md)
- [`../architecture/constraints.md`](../architecture/constraints.md)
- [`../project/tasks/T-001-define-local-technical-architecture.md`](../project/tasks/T-001-define-local-technical-architecture.md)
- [`0004-local-first-development.md`](0004-local-first-development.md)

## Official references

- [Next.js support policy](https://nextjs.org/support-policy)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js version 16 upgrade requirements](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Node.js release status](https://nodejs.org/en/about/previous-releases)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
