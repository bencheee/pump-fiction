# T-004 external design handoff v0.4-frozen

- **External package status:** Frozen
- **Repository acceptance status:** Accepted in approved `T-004` delivery `3529d318cf647094c640807671b2050502e8be92`
- **Prepared:** 2026-08-31
- **Owner:** User
- **Executor:** Codex primary agent
- **Task:** [`T-004`](../../project/tasks/T-004-audit-and-accept-design-handoff.md)
- **Return contract:** [`handoff-prompt.md`](handoff-prompt.md)

This compact manifest identifies the external mobile-design package audited for implementation. Repository product and architecture documents remain canonical for behavior and technical boundaries. This package is canonical for visual and interaction intent only where it does not conflict with them.

## Frozen package identity

- Owner-held ZIP: `/Users/sandro/Desktop/design_handoff/pump-fiction-v0.4-frozen.zip`
- ZIP SHA-256: `13b70da74792d90eaa646c570b5d857aac45874a13dbc12a406900901c3d2719`
- Working extraction used for audit: `/Users/sandro/Projects/Private/pump-fiction/temp_handoff`
- Package scope: 24 screens, 7 overlay families, 202 addressable frames, 9 critical flows, 404 structural PNG references, 38 SVG icons, and 8 WOFF2 font files

### Key artifact checksums

| Artifact | SHA-256 |
| --- | --- |
| `HANDOFF.md` | `079273dd8bdab888b3f82e2158f155b09835c1c0b2dcb2704ba7abd6382de3b3` |
| `FINDINGS.md` | `63b0e960f913f775a1a1addb372616c71adf30791df83d32092172a3f2d8cda9` |
| `OWNER-DECISIONS.md` | `cbf4f61e4ad26f7312890327e32172eb5be9b9d7a23180f8ce1b2dc98ccee55a` |
| Editable `.dc.html` source | `f2d0131d2b70e4aaeb486d8a247b31782c1272b11862b70bd46269fb607d5537` |
| `support.js` | `8fe7df74405f3c55f49b7249c74ea1397e65d07dea2b1bd3b4a489bec2e28cbe` |
| `tokens/pump-fiction.tokens.json` | `b208d2f20080567ed02387240b7dafc0026e9fc589ac7a2bd7067db22abe19ba` |
| `spec/state-ids.json` | `3093fbbf7b7f2ce3ed33b64816a6e54f866c3448cc1b8c746e27a7d41b0d119c` |
| `inventory/frame-inventory.json` | `e0b8b3e488477c623b9eff04836f683f84819fe8c466766a1aedeead355b12df` |
| `reference/capture-manifest.json` | `f50c4579543a66acf6f68137a1205a8af31ce3c84ff7ee87b8177884179795ea` |
| `reference/SHA256SUMS.txt` | `637c6f001def9ed89cbde4dadd187ea51a993ab9105838b78d5f3a2821542c3d` |
| Font manifest | `e7c5d09561952e65febedc2e625868da723244fb56ad8fe04852397219ac4836` |
| Icon manifest | `f0293dbab7c8f69c60f8f821fd5787219c8fcd7d3f803ebbb55794e69e9f2a48` |

## Authority and fidelity

Use the 404 v0.3 PNGs for:

- screen/state inventory and overall structure;
- row heights, padding, spacing, type sizes and weights;
- visible copy, chart geometry, badges, and skeleton layout;
- reflow comparison between 390 × 844 and 360 × 800.

Use the v0.4 prototype, tokens, and specifications for:

- `--pf-border-control` and `--pf-text-3-deep` colors and contrast;
- save, validation, and outcome cue placement on `S06`, `S08`, `S09`, `S10`, `S12`, `S20`, `S22`, and `S24`;
- corrected `PF-S09-validation` and `PF-S10-validation` fixtures.

Those v0.4-only areas and the known loading-frame ghost are excluded from pixel-diff against the v0.3 PNGs. WebKit raster verification moves to the later approved implementation-validation scope. Outside those exceptions, unexplained differences remain findings.

## Assets and licensing

- Vectors: 38 frozen Lucide SVG files from `lucide-static@1.34.0`, ISC license.
- Fonts: Barlow and Barlow Semi Condensed, four weights each, WOFF2 Latin subset, SIL OFL 1.1.
- No paid asset, runtime font request, icon font, or unlicensed production asset is required.

## Resolved implementation decisions

| External question | Repository decision |
| --- | --- |
| `OQ-R1` | Persisted identifiers and route parameters are opaque PostgreSQL UUIDs; URLs omit trailing slashes; malformed or unavailable identifiers use the App Router not-found boundary. |
| `OQ-R2` / `OQ-I5` | Sheets/dialogs are transient parent-route state. Opening one creates a dismissible history entry; Back dismisses the topmost overlay before leaving its parent. |
| `OQ-L2` | Background may extend under browser/OS chrome; top-bar content starts below the top safe-area inset and bottom-fixed controls include the bottom inset. |
| `OQ-I4` | No general offline or cross-device sync in the local MVP. Ordinary writes are transactional with generic retry; active-workout conflicts use the accepted revisioned recoverable flow. |

The remaining 12 questions in the external register are explicitly non-blocking and retain their documented defaults or out-of-scope status.

## Audit evidence

- All package JSON artifacts parsed successfully.
- `reference/` contains exactly 404 PNG files and no stray `-3x` copies.
- `shasum -a 256 -c reference/SHA256SUMS.txt` passed for all 404 PNGs on 2026-08-31.
- The package documentation was corrected without changing design intent: limitation counts, OD-015 inventory, OD-011 raster wording, resolved chart-state wording, and the current PNG-count invariant.
- No feature test or application behavior test was run.
