# Codex Working Agreement

## Project intent

This repository contains a personal, non-commercial wedding invitation and RSVP website. Read the following documents before planning or changing the project:

1. `docs/PROJECT_BLUEPRINT.md` ƒ?" approved product scope and architecture.
2. `docs/CODEX_SETUP_PROMPT.md` ƒ?" initial implementation brief and delivery rules.
3. `docs/CODEX_CLOUD_HANDOFF.md` ƒ?" cloud workflow and platform handoff.

If implementation and documentation disagree, stop and report the conflict. Do not silently reinterpret an approved requirement.

## Current stage

Phase 1 is complete. Template 01 has an interactive, mock-only preview at /design-preview. Keep changes within the user-authorized phase; real Google Sheets integration and production deployment require separate authorization.

## Non-negotiable product decisions

- One public invitation URL for all guests; no guest accounts.
- Vue 3, Vite, TypeScript, and Tailwind CSS for the frontend.
- A Node.js Vercel Function for `POST /api/rsvp`.
- Google Sheets via a server-side service account.
- Route RSVP rows to `BRIDE_RSVP` or `GROOM_RSVP` by `guestSide`.
- RSVP fields: identifiers, guest name, bride/groom side, YES/NO attendance, and an optional message.
- There is no guest-count field anywhere in the UI, API, Sheets schema, summaries, or tests.
- Two independent gift QR images: one for the bride and one for the groom.
- No public RSVP read endpoint and no separate administration dashboard in the MVP.
- Never expose Google credentials to the browser or commit secrets.
- Never deploy production, create paid resources, configure external secrets, or mutate Google/Vercel resources without explicit approval.

## Engineering rules for later phases

- Keep invitation content, theme, animation settings, media paths, map link, music, and QR details configurable.
- Keep business logic independent of Vercel-specific request/response objects.
- Validate all RSVP input server-side with Zod and sanitize spreadsheet values against formula injection.
- Reuse `submissionId` for retries and document duplicate detection as best-effort; Google Sheets is not a transactional database.
- Do not log guest names or messages.
- Do not rely on in-memory rate limiting in serverless functions.
- Prefer CSS and Intersection Observer for effects; add GSAP only if an approved interaction truly needs it.
- Respect `prefers-reduced-motion`, require user interaction before audio playback, lazy-load noncritical media, and optimize for iOS Safari and Android Chrome.
- Preserve portability: adapters may be replaced when moving away from Vercel, while domain/application logic should remain reusable.

## Delivery workflow

- Work directly on main and push verified changes there; the project owner explicitly authorizes direct integration and does not require feature branches or pull requests.
- Keep `main` production-ready and protected by review/CI when repository settings permit.
- Run lint, typecheck, tests, and build before claiming a phase is complete.
- List changed files, verification evidence, decisions, and blockers in every handoff.
- Preview deployments may be used for review. Production deployment always requires explicit approval.


