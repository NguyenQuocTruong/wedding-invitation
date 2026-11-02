# Wedding invitation — Phase 1

Vue 3 + Vite + TypeScript + Tailwind CSS foundation. All invitation sections are
placeholders; RSVP collection, Google Sheets, animation, audio and QR downloads
are deferred to their approved phases.

## Local development

Use Node.js 24 (see .nvmrc) and npm 11.

```sh
npm ci
npm run dev
```

Vite serves the frontend on port 5173. It does **not** execute api/rsvp.ts.
No environment variables are needed. .env.example documents future server-only
bindings; never place credentials in VITE_ variables.

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm run preview
```

Build output is dist/. Preview serves only static output, normally on port 4173.
Use npm run format to format new changes and npm run test:watch during development.

## Layout and dependencies

- src/app and src/components: Vue placeholders, including independent bride/groom gift sections.
- src/config: replaceable event content, theme and effect settings.
- src/types and src/services: RSVP types and reserved HTTP endpoint.
- server/domain: portable repository contract and separate BRIDE_RSVP/GROOM_RSVP targets.
- server/application: safe unavailable response; infrastructure/utils reserve later adapters.
- api/rsvp.ts: Node Vercel entrypoint. POST returns 503 RSVP_NOT_CONFIGURED;
  other methods return 405 with Allow: POST. Nothing is stored or reported as saved.
- tests: boundary tests exercising the actual handler.
- .github/workflows/ci.yml: clean installation, lint, formatting, typecheck, tests and build.

Vue is the sole runtime dependency. Development dependencies provide Vite/Vue
compilation, Tailwind's Vite integration, TypeScript/vue-tsc, ESLint with Vue and
TypeScript rules, Prettier, Vitest, and Node/Vercel types. No Google SDK, animation
library, database or paid service is needed. Zod validation belongs to Phase 3,
before the API starts accepting guest data.

## Connect Vercel later

No Vercel resource has been created by this change.

1. Review/merge this PR only after CI passes and approval is given.
2. Before importing, ensure the first deployment will be a **Preview**. Vercel
   import may immediately create a Production deployment. If Preview-only import
   is unavailable, defer import until production is explicitly approved; alternatively
   have the owner configure the project without Git linkage, then deploy this feature
   branch as Preview using the Vercel CLI (no --prod).
3. Select the GitHub repository, root directory '.', Vite preset, Node 24,
   install command npm ci, build command npm run build, output directory dist.
4. Enable PR Preview Deployments. vercel.json disables automatic Git deployments
   from main as a guard; also check project-level production settings before linking.
   This does not prevent manual production deployments.
5. Phase 1 needs no secrets. Configure Preview and Production secrets separately
   only in Phase 3 after Google setup is explicitly authorized.
6. Verify Preview: the invitation placeholders load, GET /api/rsvp returns 405,
   and POST /api/rsvp returns 503 with no-store. No SPA rewrite is needed for this
   single-page root route; /api remains handled by Vercel Functions.
7. Review Preview on mobile. Production branch/domain setup and deployment need
   separate explicit approval. Never run vercel --prod as part of Phase 1.

For optional full local function emulation, use an owner-approved Vercel CLI and
project with vercel dev. Vite alone only tests the frontend; Vitest tests the
function boundary without contacting Vercel or Google.

The approved scope and business decisions remain in docs/PROJECT_BLUEPRINT.md.
