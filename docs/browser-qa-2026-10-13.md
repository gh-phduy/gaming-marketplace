# Browser QA — 2026-10-13

Tested the local production build at `http://localhost:3000/en` in the Codex
in-app browser against the configured Supabase project and Stripe test mode.
This is a manual smoke test, not an automated browser E2E suite.

## Verified

- Homepage Hero tabs: four switches between digital products and direct top-up.
- Navbar product search: Marathon suggestion, search results and product detail.
- Platform filter: PC excludes the incompatible product; clearing restores it.
- Cart: add item, increase/decrease quantity, correct totals and persistence after reload.
- Stripe test checkout: Marathon, $39.99, payment success and recorded completed order.
- Seller directory/profile: search Arcade Hub, matching rating and review count,
  seeded review excerpts, chat panel opens with empty Send disabled.
- Account: logout and email login with the dedicated test account.
- My Orders: opens recent order history; the newly paid order is visible.
- Seller workspace: create a draft offer and verify it persists after reload.
- Direct top-up: search PUBG, open detail, reject missing UID, retain test UID,
  package and $1.18 total when navigating to checkout. No top-up payment made.
- Responsive homepage at CSS widths 722 and 1111: small-screen horizontal lists
  with edge fades, larger-screen three-column Popular Games with six visible cards;
  no document horizontal overflow at either width. Temporary viewport reset.

## Defects fixed during QA

1. My Orders had no navigation action and Recent Orders always showed an empty
   static list. Added locale-aware navigation and buyer-owned Supabase order
   history with loading/error states. Added four regression tests.
2. Top-up detail returned HTTP 500 with `DYNAMIC_SERVER_USAGE` in production.
   Removed partial category/slug static generation and matched the index's
   per-request rendering. Rebuilt and verified navigation through the actual card.
3. README claimed saved listing editing; the UI currently supports creation and
   status management. Corrected the documented scope.

## Automated checks after fixes

- Vitest: **47 files, 282 tests passed**.
- TypeScript / Next route type generation: passed.
- Production Next.js build: passed.
- ESLint: **0 errors, 201 warnings**; warning cleanup remains technical debt.

## Limits and retained test data

- No saved-listing edit UI yet. Analytics, balances, verification, cashback and
  some account panels remain prototype/sample UI.
- Chat composition UI was inspected; no messages sent and cross-account Realtime
  delivery was not tested in this run.
- Signup/email confirmation, OAuth, password reset, upload, refunds, payment
  failure/retry and hosted Cloudflare/GitHub CI were not tested in the browser.
- Footer informational links require a separate completeness audit.
- The sandbox order and `QA browser draft 2026-10-13` remain for inspection. The
  offer is a draft and was never published. No real payment or key delivery occurred.
- No GitHub push or deployment was performed. Only the app on port 3000 is running.

Local screenshots and command logs are under `.codex-artifacts/browser-qa/`
(ignored by Git). Do not commit credentials or payment-session artifacts.
