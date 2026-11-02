# Template 02 fidelity repair

User reports broken layout and missing effects, requests Superpowers and 12ui review against the supplied source.

## Evidence

The before screenshot at 390px shows source names/date overlap, clipped calendar, and white event text disappearing. Source custom fonts were never declared; fixed-coordinate typography fell back to Lora. Rectangular SVG masks retained the square intrinsic aspect ratio, letterboxing the 848px event background. Desktop canvas was capped at 600px instead of source 430px. Opening was a replacement, and source continuousAnimation/easing/borders/shadows were discarded.

## Repair

- Restore all eight source webfonts and cache source images/masks locally.
- Separate renderer helpers, pin geometry/color/border/shadow regression cases, then fix the four observed failures.
- Restore full rectangular fills, stretched SVG shapes, source fonts and 430px canvas.
- Reuse source opening markup and its scoped CSS with confirmed real names/date; restore floating symbols, seal, floral layers, shine and opening exit.
- Respect source reveal direction, fade/scale, easing and looping pulse/wobble. Preserve pause and reduced motion.
- Compare rendered source snapshot and repaired page; check 375/390/768/1440 widths, image/font requests, modal and keyboard behavior.
- Run required checks, independent review, deploy exact verified source.

## 12ui

Loaded requested 12ui skill and its improve reference. CLI is installed, but auth status reports no connected credentials and cannot generate a sign-in link. Requested user connection code via https://12ui.com/connect-cli; keep visual/browser repair moving independently. Do not claim a 12ui-generated comparison or 100% match until the tool actually runs.
