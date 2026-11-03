# Connect private Google Sheets for RSVP

The owner has supplied the production spreadsheet. Keep it Restricted/Private; do not grant access to anyone with the link. The spreadsheet ID belongs in server configuration, not public invitation content.

## Google account setup

1. Create or select a Google Cloud project for the invitation.
2. Enable **Google Sheets API** in that project.
3. Open **IAM & Admin → Service Accounts**, create `wedding-rsvp`, and skip project-wide roles. This is a service account, not an OAuth web/desktop application.
4. Open the new account by clicking its email in the service-account list. Select **Keys → Add key → Create new key → JSON → Create**. Store the downloaded JSON privately on your device.
5. In the owner's spreadsheet, share only this file with the JSON's `client_email`, granting **Editor**. Leave general access Restricted.
6. In Vercel project settings, add the following **Production** environment variables. Use `GOOGLE_PRIVATE_KEY` as Secret and do not paste it into chat, issues, source files or build output.

| Variable                       | Value                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `GOOGLE_SPREADSHEET_ID`        | ID between `/d/` and `/edit` in the selected private spreadsheet URL                               |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | JSON `client_email`                                                                                |
| `GOOGLE_PRIVATE_KEY`           | JSON `private_key`, including its PEM header/footer; actual newlines or literal `\n` are supported |

Redeploy after environment changes. Preview deployments should use separate test-sheet credentials or stay unconfigured; do not give unrelated preview branches access to the production spreadsheet.

## Server behavior

The server exchanges a signed service-account JWT for a short-lived Google token. All Google calls happen on the server. `OPTIONS /api/rsvp` reveals only whether valid server configuration is present; it never returns spreadsheet data. `GET /api/rsvp` remains disallowed. The popup checks availability when opened and stays disabled without configuration.

On a valid submission, the server safely creates missing `BRIDE_RSVP` and `GROOM_RSVP` tabs and initializes only verified empty tabs. Existing nonmatching headers/data are never overwritten. The expected header is:

`submission_id | client_id | guest_name | attendance | message | submitted_at | source`

Responses are routed by `guestSide`. Text is written with RAW input and formula-prefix escaping. Retry deduplication checks the submission UUID before append and after ambiguous failures; Sheets has no transactional unique constraint, so concurrent identical requests remain best-effort rather than exactly-once.

## Final connection check

After the owner configures the account and shares the file, verify authenticated access and an actual test submission to each destination before considering live delivery complete. A success message appears only after Google acknowledges a write or the same submission UUID is already present. Remove clearly marked test records after verification. Do not infer successful storage from availability alone.

If setup fails, check API enablement, the exact shared service-account email, Editor access, all three Production bindings, and a redeployment. Google error details and credentials are never sent to guests; the popup keeps the entered information and supports retry with the same UUID.
