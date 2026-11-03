# Private Google Sheets RSVP integration

**Target:** the private spreadsheet supplied by the owner (its ID is stored only in server configuration). Keep Google credentials server-only; the browser never accesses Sheets directly. No public endpoint returns guest records. The environment currently has no Google identity or project bindings, so actual Google writes and enabling live submission remain blocked on the owner's service-account setup.

## Interfaces and ownership

- Domain `server/domain/rsvpRepository.ts`: RSVPRecord extends RSVPInput with server-generated submittedAt. RSVPRepository.save(record): Promise<{ duplicate: boolean }>. Destination tabs are BRIDE_RSVP and GROOM_RSVP. Seven columns: submission_id, client_id, guest_name, attendance, message, submitted_at, source.
- Adapter `server/infrastructure/googleSheetsRepository.ts`: exports GoogleSheetsConfig {spreadsheetId, clientEmail, privateKey}, createGoogleSheetsRepository(config, fetchImpl?: typeof fetch): RSVPRepository, and readGoogleSheetsConfig(env: NodeJS.ProcessEnv): GoogleSheetsConfig | null. No secrets in errors/logs. Google OAuth service-account JWT, private ACL, tab/header setup only when safe, RAW cell writes and formula-prefix escaping, best-effort ID dedupe before append and after ambiguous append failures, bounded transient retries/timeouts.
- Root owns Zod input validation/application/API, API tests, browser integration tests, environment config and release.
- Client task owns src/services/rsvpApi.ts, shared/RsvpDialog.vue, and client unit tests. Public OPTIONS /api/rsvp returns only {enabled:boolean}, never guest data; all reads with GET remain405. POST success {ok:true} only after repository confirms a save or matching existing ID; failure codes400/413/415/503. Disabled until server configuration exists. Client checks OPTIONS on open, validates, posts JSON, reports safe retry errors and only shows success after ok:true. Stable submissionId for an unchanged retry; new ID after editing a failed submission. Persist only the device UUID locally; names/messages stay in page memory.

## Required behavior and checks

1. Validate UUIDs, trimmed name2–100, BRIDE/GROOM, YES/NO, optional message<=500; reject unexpected fields/guest-count, oversized body, invalid JSON, wrong content type, cross-origin browser POST and non-empty honeypot.
2. Keep the UI and existing pending state when service credentials are absent. No mock success in production. Source1/preview behavior remains unchanged; enable template2 only through runtime availability, no manual frontend flag.
3. Adapter does not overwrite mismatched existing sheet headers/data. Only create missing named tabs and initialize verified empty tabs. Use columnA dedupe; Sheets does not provide transactional uniqueness, so do not claim exactly-once delivery. Do not use in-memory rate limits. Preserve server-only credential boundaries.
4. Tests first: application/API validation and save failure/success; adapter Google HTTP protocol, signed JWT/token flow, safe tab initialization, routing, RAW/formula escaping, transient failures and duplicate retries; client pending/success/failure/retry IDs; browser chair/modal and real frontend submission flow with mocked network responses. No actual guest/test rows written before authorized Google access exists.
5. Run all required checks, focused review and fix important findings, configure the supplied spreadsheet ID as production Config only, deploy verified code. Keep submission unavailable without credentials. Provide exact secure setup steps and ask for only the missing user action; never request private keys in chat.

## Progress

Adapter and client tasks are implemented. Domain/API tests and validation are green; full suite currently102 tests. No live Google identity exists yet; owner is following the service-account setup instructions. Root is completing browser submission/retry integration, review, production configuration and deployment. Real writes stay disabled until credentials are supplied.
