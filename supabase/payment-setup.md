# Stripe test checkout

Checkout now calls the application's `/api/create-payment-intent`, not the old
Supabase Edge Function. Supabase stores the catalog, users, and confirmed orders.

## Configuration

Keep these in the ignored `.env.local` file:

```dotenv
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Only the publishable key goes to the browser. The secret and service-role keys
are read by Node.js API routes. Run `payment-security.sql` in Supabase SQL Editor
to remove browser write access to `orders`; it preserves buyer/seller read access.
The full `setup.sql` also removes browser write access on fresh setups and reruns.

## Local webhook delivery

The verification endpoint records a successful payment when the buyer returns.
Webhook delivery also records payment if the buyer closes the browser. To receive
real Stripe events on localhost, run the official Stripe CLI yourself:

```powershell
npx --yes @stripe/cli login
npx --yes @stripe/cli listen --events payment_intent.succeeded --forward-to localhost:3000/api/payments/webhook
```

Paste the signing secret printed by `listen` into `STRIPE_WEBHOOK_SECRET`, replacing
the local signature-test value currently in `.env.local`. Restart the dev server
if it does not reload the env file. Keep the listener terminal running. The listener
was not started automatically because automatic approval review blocked the
background launch.

For deployment, register an HTTPS endpoint ending in `/api/payments/webhook` in
Stripe and use that endpoint's signing secret in the hosting environment. Configure
the other environment variables there too. A local signature test does not mean a
Stripe Dashboard webhook endpoint has been registered.

## Behavior

- Authentication is checked against Supabase Auth on the server.
- Requests contain product IDs and quantities, not trusted prices. The server loads
  published products, checks stock and USD currency, then computes integer cents.
- Payment metadata binds the buyer and immutable line prices to the Stripe intent.
- Retrying the same cart request reuses Stripe's idempotency key. Database writes
  use deterministic order UUIDs to handle duplicate verification/webhook delivery.
- The success page asks the server to retrieve and verify Stripe status and buyer;
  URL status and sessionStorage cannot mark an order paid.
- Failed payments and failed database recording preserve the cart. Recording failures
  can be retried without asking the buyer to pay again.
- This is a card-only test integration for demo products and direct top-ups. It rejects live Stripe keys.
  Direct top-up prices come from the server's package catalog. Player details must
  be entered and confirmed before the payment form loads; older checkout snapshots
  can collect missing player details on the checkout page.
  Top-up orders use deterministic order IDs and a NULL product ID in the existing
  `orders` table, with status `processing`. Package, player details, and region are
  retained in Stripe test payment metadata, linked by `stripe_payment_intent`.
  Payment verification restores a server-derived top-up snapshot and preserves
  the buyer's unrelated shopping cart. Packages below $0.50 cannot use USD card payment.
  No game currency is delivered: a top-up provider still needs to be integrated.
  Real key delivery, stock reservation/decrement, refunds, and
  pending asynchronous payment UX still need a production implementation.

## Verified on 12 October 2026

- Real Stripe test API: one product, $39.99, confirmed and recorded in Supabase.
- Fake client price/amount ignored; forged URL success rejected before payment.
- Retried creation reused the same intent; repeated verification produced one row.
- Two product lines, $109.97, recorded using a locally signed webhook request.
- Invalid webhook signature rejected; repeated webhook created no duplicate rows.
- Declined test card produced no order.
- Hosted database rejects authenticated browser order inserts with error `42501`
  after `payment-security.sql` was applied.
- A dedicated `Stripe Test Buyer` and its test orders are retained for inspection.
  Its local test credentials/session are stored only under ignored
  `.codex-artifacts/payment-validation/`.
- Browser Payment Element: card `4242` submitted successfully, returned to `/en`,
  and displayed the recorded $39.99 order after reload. Screenshot:
  `../.codex-artifacts/payment-validation/checkout-success.png`.

Tests: `node node_modules/vitest/vitest.mjs run lib/payments/server.test.ts app/api/create-payment-intent/route.test.ts`
and `node supabase/tests/verify-schema.cjs`.

Sources: [Stripe PaymentIntents](https://docs.stripe.com/payments/payment-intents),
[Stripe webhook testing](https://docs.stripe.com/webhooks/test),
[Stripe testing](https://docs.stripe.com/testing).
