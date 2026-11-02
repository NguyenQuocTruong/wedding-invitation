# Codex Setup Prompt

Use this prompt when starting the first implementation task in Codex Cloud.

---

Read these files completely before changing anything:

- `AGENTS.md`
- `docs/PROJECT_BLUEPRINT.md`
- `docs/CODEX_CLOUD_HANDOFF.md`

This repository is the approved Wedding Invitation & RSVP project. GitHub is the source of truth. Do not use GitLab.

## Current task: Phase 1 only

1. Inspect the repository, current branch and existing files.
2. Restate the Phase 1 scope and identify any conflict in the documents.
3. Propose a concise implementation plan.
4. Initialize Vue 3 + Vite + TypeScript + Tailwind CSS.
5. Configure a maintainable project structure matching the blueprint.
6. Configure ESLint, formatting, Vitest, type checking and the required npm scripts.
7. Add a GitHub Actions workflow for lint, typecheck, tests and build.
8. Add `.env.example`, `.gitignore`, `vercel.json` if needed, and setup documentation.
9. Create only a minimal serverless API boundary and interfaces/mocks needed to prove the structure; do not connect real Google credentials in Phase 1.
10. Run all applicable checks and report exact results.
11. Create a feature branch and pull request. Do not merge automatically.

## Approved technical constraints

- Vue 3 Composition API, Vite, TypeScript and Tailwind CSS.
- Node.js Vercel Function for `POST /api/rsvp`.
- Zod server-side validation.
- Google Sheets adapter behind an interface.
- `BRIDE_RSVP` and `GROOM_RSVP` destination tabs; optional `SUMMARY` formulas later.
- RSVP has guest name, bride/groom side, YES/NO attendance and optional message, plus client/submission identifiers.
- There is no guest-count field.
- Two independent QR images exist later, one for the bride and one for the groom.
- Keep invitation and animation configuration replaceable.
- Keep business logic portable and independent from Vercel-specific APIs.

## Safety and authorization boundaries

- Do not deploy production.
- Do not create paid resources.
- Do not create or modify Vercel, Google Cloud or Google Sheets resources.
- Do not request, print or commit secrets.
- Do not add actual QR/account details or private wedding media unless supplied and authorized.
- Do not implement later phases in the same task.
- Do not copy source, templates, imagery or branding from the reference website.

## Required handoff

Report:

- Branch and pull request link.
- Changed files.
- Dependencies added and why.
- Commands run and their exact pass/fail summary.
- Any deviations from the blueprint.
- External setup still required from the user.

---

The project must remain documentation-only until the user explicitly sends this prompt (or otherwise authorizes implementation).


