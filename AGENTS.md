# Pump Fiction agent guide

This repository contains a deployed private, single-user, phone-only web app for recording gym workouts and body progress. “Pump Fiction” is the working repository name; the user-facing name is undecided.

## Project boundaries

- Design for phones only; do not create or optimize a desktop experience.
- Nutrition and calorie tracking are out of scope.
- Do not add features that have not been explicitly agreed.
- Preserve the existing Next.js, Supabase, application-boundary, active-workout durability, mobile UI, charting, and quality choices unless the user explicitly changes them.

## Required context flow

1. Before working, read [`docs/INDEX.md`](docs/INDEX.md).
2. Use the index to read only the product, architecture, UX, or decision documents relevant to the request.
3. Before changing behavior, check the relevant accepted decisions and canonical specification.
4. When behavior changes, update its canonical documentation in the same change.

Keep the cold-start bundle to this guide and `docs/INDEX.md`. Do not preload all documentation, ADRs, or design exports.

Documentation describes the current application. Keep affected canonical documents synchronized with behavior, record cross-cutting architectural decisions in an ADR, and record small local decisions in the relevant topic document. If code and documentation disagree, report and resolve the mismatch explicitly.

For small future changes, implement and verify proportionally to risk. Run the narrowest relevant checks first; broader tests are appropriate when shared behavior, persistence, migrations, or critical workout flows change.
