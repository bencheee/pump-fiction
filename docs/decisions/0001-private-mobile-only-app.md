# ADR-0001: Private single-user mobile-only app

- **Status:** Accepted

## Context

The product is a personal gym-progress tool for one user. Designing accounts, collaboration, public sharing, nutrition tracking, or broad responsive desktop behavior would expand scope without supporting the agreed use case.

## Decision

Build a private, single-user web application exclusively for phone use. The local phase has no accounts or login. Do not design a desktop version. Nutrition and calorie tracking are outside scope.

Production-access protection is accepted as a need but its mechanism remains an open question.

## Consequences

- Navigation, forms, charts, and workout interactions optimize for phone screens and thumb reach.
- The data model need not support multiple owners in the initial product.
- Authentication is not a prerequisite for local development.
- Private production access must be decided before deployment.
- Multi-user, desktop, nutrition, and calorie features cannot be added without a new explicit decision.

## Related documents

- [`../product/overview.md`](../product/overview.md)
- [`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md)
- [`../architecture/constraints.md`](../architecture/constraints.md)
