# Verify live RSVP storage

The owner has configured all three Production bindings. The first activated deployment reports enabled:true, but the first marked BRIDE test POST returned503, so live storage has not yet been confirmed. Do not claim success until actual Google acknowledgment and probe verification.

Google private keys remain only in Vercel Secret storage. Add the optional Node build verification utility with tests, then set a temporary RSVP_VERIFY_PROBES Production Config containing only synthetic submission/client UUIDs (never guest data or credentials). The normal build remains a no-op for Google when this flag is absent.

The utility must validate both fixed tab schemas and exact probe identity/marker values during read-only verification, reject duplicates/mismatches, never clear cells or delete sheets/rows, and output only bounded stage/status/approved reason enums. This provides safe auth/permission diagnostics without exposing secrets. After real API tests succeed for BRIDE/GROOM and unchanged retries, verify probe records, identify them clearly for manual owner cleanup, remove the temporary flag and confirm both public invitation/API routes. If Google access is blocked, report the exact evidenced missing setup step rather than changing public guest error responses or guessing.

Review ruling: a concurrent owner sort can move real guest data into a previously captured range. The utility is therefore read-only, with a regression proving it never mutates Sheet data. This avoids requiring an exclusive editing window or risking guest records.
