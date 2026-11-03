# Google Sheets infrastructure

`googleSheetsRepository.ts` implements the approved RSVPRepository boundary with Node crypto and fetch. The three server-only bindings are documented in `.env.example` and `docs/RSVP_GOOGLE_SHEETS_SETUP.md`.

The adapter routes BRIDE to BRIDE_RSVP and GROOM to GROOM_RSVP. It safely initializes missing tabs/empty headers, refuses incompatible existing data, uses RAW escaped cell values, and checks submission IDs before append and after ambiguous failures. All network operations have bounded deadlines/retries. Error messages do not retain provider payloads or credentials. No guest data is logged and no process-local rate limit is used.

The HTTP application validates input with Zod and acknowledges only a confirmed repository result. Google Sheets deduplication is best-effort; concurrent writes have no transactional uniqueness guarantee. Real Google access must be verified separately once the owner configures service-account credentials and private-file Editor access.
