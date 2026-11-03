# Template 2 RSVP popup and corrected schedule

Implement the user's requested RSVP popup and chair-icon quick action on template 2. Keep the current floating glass material and bounce, add the chair to the bottom-right shortcuts only on template 2. Both the in-page RSVP CTA and the chair open one accessible native dialog with name, bride/groom side, YES/NO attendance and optional message (no guest-count field). Support keyboard/Escape, backdrop close, focus restoration, small screens and draft preservation while the page remains open.

The API currently returns RSVP_NOT_CONFIGURED and Vercel has no Google configuration. Build the real form UI while keeping submission explicitly unavailable until a real Sheets connection is supplied; never claim an RSVP was saved. The owner has been asked for the target spreadsheet while UI work continues. Do not create resources or use browser-local data as a fake RSVP database.

Use the newly confirmed schedule as canonical shared data: 09:00–10:00 arrival/photos, 10:30–12:00 banquet, 13:00 wedding ceremony, 14 November 2026, Vietnam time. Update timeline icons, source-template event text and countdown target together; preserve existing locations/names/media. Shared template-1 data receives the same corrected factual schedule, while the new popup/chair UI stays scoped to template 2.

1. Update production expectations for all three time slots and ceremony countdown; observe failure before implementation. Add popup browser checks before changing the existing placeholder.
2. Update typed data, canonical documentation, template-2 source text overrides, and shared timeline icon for arrival/photos.
3. Implement RSVP dialog and optional chair action, wire both entry points on template 2. Keep genuine pending state for persistence.
4. Verify both routes, three timeline slots, countdown target, modal inputs and choices, disabled submit without configuration/no requests, both entry points, focus/Escape/draft preservation, short/landscape viewport and existing music/gift/map controls.
5. Run lint, typecheck, all unit tests, build, focused browser checks and fresh review. Publish only verified task files to existing main, deploy the exact commit to production and verify both public URLs.
