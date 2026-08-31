# T-004 exact external-design return contract

Return one frozen, version-labelled package for the existing phone-only design. Do not redesign the application, add product behavior, or treat generated code as production implementation.

The package must contain:

1. an editable, inspectable design source and offline clickable prototype;
2. a complete screen/state/frame inventory mapped to routes, critical flows, and applicable MVP criteria;
3. fixed reference images for every accepted frame at 390 × 844 @3x and 360 × 800 @3x, with exact environment and capture metadata;
4. machine-readable tokens plus a readable reference for color, typography, spacing, sizing, radii, borders, shadows, elevation, opacity, and motion;
5. component anatomy, variants, interactive states, reuse rules, and 320–430 px phone reflow behavior;
6. exact layout measurements, safe-area rules, fixed/sticky behavior, scroll boundaries, and keyboard-open behavior;
7. interaction annotations and prototype coverage for all critical flows, including focus, Back/Escape, destructive confirmation, persistence feedback, retry, and reduced motion;
8. exact visible copy, validation and failure messages, wrapping/truncation behavior, units, dates, numbers, and accessible labels;
9. complete chart specifications covering data eligibility, series, axes, domains, selectors, tooltips, empty/loading/failure states, accessible alternatives, and improvement semantics;
10. implementation-ready SVG/raster/font assets with manifests, checksums, acquisition details, and licenses;
11. accessibility annotations for contrast, type scaling, focus order, labels, touch targets, reduced motion, and non-color cues;
12. known deviations, unresolved questions, implementation risks, accepted exceptions, and a changelog.

Use English for package documents and UI copy. Keep `Pump Fiction` replaceable text. Do not invent an answer where the repository brief or design is silent; record an explicit question instead. Product behavior and accepted architecture remain authoritative over the visual package.

The final package may retain the v0.3 PNGs as structural references instead of re-exporting them, provided it states that the v0.4 prototype/specifications are authoritative for corrected color/contrast tokens, save/validation/outcome cue placement, and corrected S09/S10 validation fixtures, and excludes those areas from pixel-diff.
