# Template 01 production UI

The owner requested the approved template on production and explicitly authorized deployment to the existing wedding-invitation Vercel project.

The root now uses the complete approved Template 01 layout instead of the Phase 1 scaffold. `src/pages/InvitationPage.vue` assembles the envelope, hero, event details, album, countdown, RSVP, two gift cards and footer. `src/composables/useInvitation.ts` provides typed content and the preview mode to the existing components. The wrapper at `/design-preview` keeps its sample data and simulated interactions.

## Production content

Edit `src/config/event.ts` with confirmed names, date labels, timezone, venue, map URL, hero, photo records, music and both gift records. The current release intentionally has no wedding date, real album, map link, audio or bank QR. It shows pending states and clearly labels the hero illustration. No sample 2027 date or bank image is presented as real.

The RSVP form remains disabled. Its production submit handler returns immediately and cannot show simulated success. `POST /api/rsvp` remains the existing 503 boundary; no Google resources, secrets or spreadsheet writes were configured. Opening real RSVP requires a separately implemented and verified backend, not merely flipping a content flag.

## Validation

- `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build`.
- 9 unit tests, including missing-date and absent production gift configuration.
- `tests/browser/production.mjs` checks 375/390/768/1440 widths, envelope and replay focus, reduced motion, no overflow, missing content, disabled RSVP (including programmatic submit), QR/map isolation and no API traffic.
- `tests/browser/design-preview.mjs` checks the retained preview envelope, gallery dialog, both RSVP sides/answers, QR download, music and route isolation at the same widths.
- Independent code review found no critical or important issues.

Run browser scripts with `PLAYWRIGHT_MODULE` pointing to an external Playwright installation, against built output served on port 5174; override `PREVIEW_BASE_URL` and `SCREENSHOT_DIR` as needed. Native iOS Safari/Android validation and final event/media/QR accuracy remain outstanding.

## Release

Push verified main, then create a production deployment from its exact commit SHA using the Vercel connection. Keep automatic Git deployments disabled as configured; this request authorizes this release. Inspect READY state and assigned domain before reporting the link.
