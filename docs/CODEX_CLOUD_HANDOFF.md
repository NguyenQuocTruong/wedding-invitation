# Codex Cloud Handoff

## Purpose

This document preserves context between the product conversation, GitHub and Codex Cloud. Codex Cloud does not need the original chat history once these repository documents are current.

## Canonical context order

1. `AGENTS.md` ƒ?" operating and safety rules.
2. `docs/PROJECT_BLUEPRINT.md` ƒ?" approved product and architecture decisions.
3. `docs/CODEX_SETUP_PROMPT.md` ƒ?" prompt for the first implementation phase.
4. Pull request descriptions and accepted review comments ƒ?" task-specific decisions.

When a requirement changes, update the blueprint in the same pull request as the implementation. Do not let chat-only decisions become the only record.

## Platform connections

### Codex Cloud to GitHub

The Codex Cloud environment is already connected to `NguyenQuocTruong/wedding-invitation`. Confirm the selected repository and base branch at the start of every task.

### GitHub to Vercel

This connection is intentionally deferred until the repository contains a buildable application. Later:

1. Import the GitHub repository into Vercel.
2. Confirm framework/build settings.
3. Keep pull request Preview Deployments enabled.
4. Configure environment variables separately for Preview and Production.
5. Do not trigger or approve a production deployment without explicit user approval.

### Codex to Vercel MCP

Vercel MCP is optional. Add it later when deployment/log inspection is useful. MCP access does not replace GitHub integration, Vercel Git integration, or explicit production approval.

### Google Sheets

Google Cloud, the service account, spreadsheet and secrets are external setup tasks. Do not automate them until the user authorizes access and approves the target resources. Never place credentials in a prompt, issue, pull request, source file or build log.

## Recommended task workflow

1. Open the repository-backed Codex Cloud environment.
2. Start a task with a bounded phase and name the documents Codex must read.
3. Codex confirms repository and base branch.
4. Codex creates a `feature/*` branch.
5. Codex implements only the approved scope.
6. Codex runs lint, typecheck, tests and build.
7. Codex creates a pull request with verification evidence.
8. Review the diff and, after Vercel is connected, test the Preview URL on a phone.
9. Merge only after approval and required checks.
10. Production deployment remains a separate, explicit decision.

## Suggested branch naming

- `docs/project-blueprint`
- `feature/project-foundation`
- `feature/invitation-experience`
- `feature/rsvp-sheets`
- `feature/gift-qr`
- `chore/production-readiness`

## First implementation task

After the documentation is accepted, paste the contents of `docs/CODEX_SETUP_PROMPT.md` into a Codex Cloud task. The expected result is a Phase 1 pull request, not a production deployment.

## Work that Codex can do independently

Without account assistance or external approval, Codex can:

- Read and update repository documentation.
- Scaffold source after implementation is explicitly authorized.
- Implement UI, API boundaries and tests with mocks.
- Create configuration examples that contain no secrets.
- Run local lint, typecheck, test and build checks.
- Create feature branches and pull requests through the authorized GitHub connection.
- Prepare Vercel and Google setup instructions.

## Work that requires user involvement or approval

- Approving OAuth/app permissions.
- Selecting or creating the actual Vercel project.
- Linking the production branch/domain.
- Purchasing or configuring a custom domain.
- Creating/selecting Google Cloud resources and enabling APIs.
- Creating a service account and sharing the actual spreadsheet.
- Supplying secrets, private media, actual QR images and account labels.
- Approving a visual direction and representative screen.
- Merging significant changes when review is required.
- Deploying or changing production.
- Creating any paid resource.

## Handoff checklist for every Codex task

- [ ] Repository and branch identified.
- [ ] Relevant documents read.
- [ ] Scope and non-goals restated.
- [ ] Changed files listed.
- [ ] No secrets or personal data introduced accidentally.
- [ ] Verification commands and results included.
- [ ] Preview/production effects stated.
- [ ] Remaining external setup or decisions listed.

## Current repository stage

The initial state after this handoff is documentation-only. No application source and no production deployment are authorized by this documentation commit.


