# ADR-0031: A shared password protects the hosted application

- **Status:** Accepted

## Context

[ADR-0001](0001-private-mobile-only-app.md) made the product private and single-user with no accounts, and [ADR-0004](0004-local-first-development.md) deferred hosting until the local application was complete. Hosting required an explicit access-protection decision.

The application was deployed on `2026-09-07` to Vercel and hosted Supabase. Hosting changes one thing local development never exercised: the application answers at a public URL. Every screen and every server action reaches the database through the service-role key, so without a gate anyone who reached that URL would hold the Owner's data — readable, writable, and deletable.

The database side needed nothing. Every table revokes all privileges from `anon` and `authenticated` and grants only `service_role`, and every function does the same. Against the hosted project both public keys were refused on every table, for reads and for writes, with Row Level Security never enabled. Closing the Data API by grant rather than by policy is what [ADR-0018](0018-local-supabase-postgres-and-server-data-access.md) already implied, and hosting confirmed it holds.

Two alternatives were considered and rejected:

- **Vercel deployment protection.** On the Hobby plan, Vercel Authentication covers preview deployments and leaves the production domain public; Password Protection needs Enterprise or a paid Pro add-on. Protecting production this way means paying for a plan to solve a problem the application can solve itself.
- **Supabase Auth with a single account.** Data access is server-side and service-role, so an account system would gate the user interface only. It would add a session stack, a second set of secrets, and a login flow that this product has no other use for, without protecting anything the middleware does not.

## Decision

One shared password, held in `PF_ACCESS_PASSWORD`, protects the hosted application.

- A middleware redirects every request that carries no valid cookie to `/unlock`. That screen trades the password for one signed cookie, `pf_access`, valid for 180 days, `HttpOnly`, `SameSite=Lax`, and `Secure` whenever the request arrived over HTTPS. The Owner unlocks their phone once and is not asked again for months.
- The signing key is derived from the password itself, so there is no second secret to rotate and changing the password invalidates every cookie already issued.
- The password and the cookie signature are both compared as fixed-length digests in constant time, and a refused attempt is delayed before it answers.
- The gate is enforced whenever `PF_ACCESS_PASSWORD` is set, and unconditionally whenever `VERCEL` is set. A deployment that lost the variable therefore denies every request rather than serving the application to anyone; it does not fall open. A local run without the variable stays open, which is what the browser suite's production server depends on.
- The active-workout outbox endpoint is not redirected. A locked-out delivery answers in the transport's own retry shape, so a queued command survives an expired cookie and replays after the next unlock instead of reading as a permanent rejection.
- Static assets and the Next.js build output are exempt, so the unlock screen renders with its own fonts.

This is not an account, and [ADR-0001](0001-private-mobile-only-app.md) is unchanged. There is no user record, no identity, and nothing in the database that knows who is asking. The password authorizes reaching the application; it does not identify anyone.

## Consequences

- The hosted application is reachable only by someone holding the password, and the hosted database is reachable only through it, because the public API keys are refused at every table.
- The protection is only as strong as the password the Owner chooses, and there is exactly one of them. A leaked password is remedied by changing the Vercel variable, which invalidates every existing cookie at the same time.
- The gate is code this project owns rather than a platform feature, so it is covered by unit tests and travels with the repository. It also means the project carries a small piece of security-relevant code of its own.
- Local development, the browser suite, and every test-support route are untouched, because the gate is absent whenever the variable is.
- `PF_ENABLE_TEST_SUPPORT` must never be set on a hosted deployment. [ADR-0029](0029-one-visibility-rule-for-test-support-routes.md) governs which routes exist; this decision governs who may reach them.
- The open question is closed. Backup format and PWA installation remain open and are unaffected.

## Related documents

- [`../architecture/constraints.md`](../architecture/constraints.md)
- [`../architecture/local-database-workflow.md`](../architecture/local-database-workflow.md)
- [`0001-private-mobile-only-app.md`](0001-private-mobile-only-app.md)
- [`0004-local-first-development.md`](0004-local-first-development.md)
- [`0018-local-supabase-postgres-and-server-data-access.md`](0018-local-supabase-postgres-and-server-data-access.md)
- [`0029-one-visibility-rule-for-test-support-routes.md`](0029-one-visibility-rule-for-test-support-routes.md)
