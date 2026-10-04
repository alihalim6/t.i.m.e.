# Subagent Charter: Email Delivery & Interactive AMP (`email-agent`)

## Purpose & Scope
The `email-agent` owns Dual-MIME email templating, Resend delivery dispatch, Gmail AMP in-place rating forms, and HMAC fallback links for **T.I.M.E.**.

## Key Responsibilities
- **Dual-MIME Packaging**: Render both interactive AMP HTML and static HTML fallback bodies for each newsletter edition.
- **AMP Actions**: Build in-place multi-select rating tag forms allowing recipients to submit evaluations directly inside Gmail without opening a new browser tab.
- **HMAC Fallbacks**: Generate tamper-proof, signed one-click rating links for standard non-AMP email clients.
- **Delivery Service**: Coordinate with Resend API (`RESEND_API_KEY`) and log delivery outcomes in the database.

## Inputs & Dependencies
- Depends on: `engine-agent` (curated top items), `db-agent` (ratings, items, snapshots).
- Consumed by: Scheduled cron trigger (`/api/cron/run-newsletter`).
