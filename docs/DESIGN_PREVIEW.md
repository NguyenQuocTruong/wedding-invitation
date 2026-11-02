# Mẫu thiệp 01 — Interactive design preview

This task implements the approved direction as a Vue demo at /design-preview.
The current user brief authorizes the complete demo despite earlier proposal text
describing a smaller representative screen. No production feature was activated.

## Run and inspect

Use Node 24 and npm ci, then npm run dev. Open /design-preview (also accepts a
trailing slash). The root path still mounts the existing Phase 1 App.

The preview is lazy-loaded by an exact pathname check; no router dependency is
needed for two independent entry views. Vercel rewrites only /design-preview and
/design-preview/ to index.html. API paths and existing routes have no new rewrites.
No Vercel resource/settings change or deployment command is part of this task.

## Files and responsibilities

- src/main.ts and src/utils/preview.ts: exact route selection.
- src/pages/DesignPreview.vue: page assembly, envelope state and focus transfer.
- src/components/preview/: EnvelopeIntro, InvitationHero, PhotoGallery,
  EventDetails, CountdownTimer, RSVPForm, GiftQRCode and MusicControl.
- src/composables/useReveal.ts: one-shot Intersection Observer reveal with cleanup
  and reduced-motion fallback.
- src/config/preview.ts: all demo content, media paths, date, map and gift records.
  Existing src/config/event.ts stays unchanged for the root page. Preview records use explicit TypeScript types.
- src/config/theme.ts: separate preview color/font tokens and motion settings; existing theme values stay unchanged.
- src/styles/preview.css: scoped-by-prefix mobile-first design and animation.
- public/design-preview/: original SVG artwork, three color groups and two
  deliberately nonfunctional QR pictures. No reference-site artwork was copied.
- public/fonts/: local Lora and Be Vietnam Pro with original OFL licenses.
- public/favicon.ico: original small icon to avoid a browser favicon 404.
- eslint.config.js: disable core no-undef for TypeScript Vue SFCs; vue-tsc checks
  identifiers and DOM types, as recommended for TypeScript linting.
- tests/preview.test.ts: exact-route isolation and countdown edge cases.
- tests/browser/design-preview.mjs: reproducible Chromium interaction/screenshots.
- vercel.json: two exact preview rewrites, main deployment guard retained.

## Mock boundaries

Dates, venue, names and map destination are labelled sample content. The map opens
a Google Maps search for the configured example city, not a confirmed wedding venue.
Images are original illustrations standing in for white portraits, floral portraits
and red traditional attire, not photos of the couple or an accurate costume study.

RSVP uses only component memory and a 600ms timer. No API calls, persistence,
Google Sheets, client tracking or credentials. Success explicitly says the response
is simulated and no real registration happened. Both sides and YES/NO remain available.

QR art is not an encoded payload. Each side has its own labelled image, download
and open-image fallback for iOS. Bank/recipient labels are demonstrably sample data.

No audio is supplied or fetched. The music control reports this demo state after
a click. If an approved file is configured later, playback starts only from the
button and handles a denied play() promise. No autoplay attribute is used.

## Animation and accessibility

CSS envelope flap opens, letter rises and seal fades in under one second; skip
and reduced motion reveal immediately. Page enters gently, sections reveal once
with opacity/8px translation, gallery hover zoom is subtle. No parallax or GSAP.

Focus moves to the hero heading after opening and returns to the intro heading on replay. Native dialog supports modal focus,
Escape, close button and previous/next buttons; arrows are optional shortcuts.
Form has persistent labels, fieldsets, native required/max-length validation,
loading state and explicit demo status. Both QR cards remain visible independently.

Font sizes, contrast and viewport checks complement browser tests. Real iPhone
Safari/Android testing remains necessary for final photo crop, native download UI,
keyboard behavior and final accessibility validation; Chromium is not proof of Safari.

## Validation

Required: npm run lint, npm run format:check, npm run typecheck, npm test, npm run build.

Browser tool is installed outside the repository; it is not an app dependency:

```sh
npm install --prefix /tmp/wedding-browser playwright
# With npm run dev -- --port 5174 already running:
PLAYWRIGHT_MODULE=/tmp/wedding-browser/node_modules/playwright/index.mjs \
  node tests/browser/design-preview.mjs
```

Override CHROMIUM_PATH, PREVIEW_BASE_URL and SCREENSHOT_DIR as needed. The check covers
375/390/768/1440 widths, envelope/focus, gallery dialog, both RSVP sides and answers,
QR download, audio demo, no API traffic, root isolation, trailing slash, skip and
reduced motion. Screenshots are written outside source by default.

## Current validation evidence

Local lint, formatting, typecheck, 7/7 unit tests and build passed. The browser check
also passed against built output at all four widths, with zero console/page errors
and no API requests. Screenshots include envelope and full page at each width,
plus mobile/desktop hero views. Native Safari/Android and hosted Vercel checks
remain pending; local success does not establish a remote Preview deployment.

Independent review found no blocking issues. Replay focus was reproduced as a
failing browser assertion, corrected and checked in the passing final browser run.
No production deployment or main merge was performed.
