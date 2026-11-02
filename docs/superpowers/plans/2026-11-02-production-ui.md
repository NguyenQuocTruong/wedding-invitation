# Template 01 Production UI Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task.

**Goal:** Publish approved Template 01 at the production root of wedding-invitation.

**Architecture:** Reuse the approved Vue preview layout and components with an injected, typed invitation context. Production reads event.ts; /design-preview retains its independent sample data and simulated interactions.

**Tech Stack:** Vue 3, TypeScript, Vite, existing CSS and Vitest/Chromium.

**Spec:** docs/PROJECT_BLUEPRINT.md and docs/DESIGN_PREVIEW.md; current owner request authorizes production UI implementation and deployment.

## Global Constraints

- Work directly on main; deploy only wedding-invitation to the existing Vercel team.
- Preserve Template 01, accessibility, reduced motion, gallery, and separate gift cards.
- No guest-count field, Google setup, paid resources, or invented personal/event/bank information.
- Missing event date must show pending copy, without a fabricated countdown or map.
- Unconfigured RSVP must be visibly unavailable, never simulate production success.
- Preview remains isolated with its existing sample behavior.

## Review Focus

- Missing date, venue, photos, QR, music and backend must have honest empty states.
- Production must not use preview date/map/QR or simulated RSVP success.
- Envelope/replay keyboard focus, reduced motion and modal Escape must work.
- No horizontal overflow at 375/390/768/1440 pixels.
- Deployment commit must match verified main HEAD.

### Task 1: Share Template 01 with explicit production configuration

**Files:** src/config/event.ts, src/composables/useInvitation.ts, src/pages/InvitationPage.vue, src/pages/DesignPreview.vue, src/app/App.vue, src/components/preview/*.vue, tests/production.test.ts

**Interfaces:** Provides typed event content and preview boolean to the existing template components; production defaults are pending, preview retains its existing config.

- [ ] Add tests asserting production has no configured date, map, demo QR, or backend success; run red.
- [ ] Extract shared layout and inject data/mode; mount it from root and preview wrappers.
- [ ] Add pending content and disable production RSVP pending backend setup; preserve preview simulation.
- [ ] Run tests and required checks.

### Task 2: Browser validation and production release

**Files:** tests/browser/production.mjs, docs/PRODUCTION_UI.md, docs/PROJECT_BLUEPRINT.md

- [ ] Verify root envelope, focus, responsive widths, gallery, unavailable RSVP/QR/map, replay and reduced motion; recheck preview interactions.
- [ ] Run lint, formatting, typecheck, unit tests and production build.
- [ ] Review diff, commit and push main, create Vercel production deployment from that exact SHA, inspect READY and verify hosted page.
- [ ] Document remaining real event/media/Google setup and report production URL.
