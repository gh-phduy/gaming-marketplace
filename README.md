# Digital Gaming Marketplace

A portfolio marketplace inspired by Difmark, built with Next.js 16, React 19,
TypeScript and Supabase. It covers product discovery, Stripe test checkout,
seller listing management and buyer–seller messaging.

This is a demonstration project. Catalog entries, seller activity and some
profile panels use sample data. No game keys are delivered or seller payouts
processed. Third-party artwork and branding belong to their respective owners;
this project is not affiliated with Difmark.

## Features and current scope

| Area | Implemented | Limits |
| --- | --- | --- |
| Catalog | Supabase-backed sections, search, filtering and sorting | Demo inventory and platform compatibility |
| Buyer flow | Cart, Stripe test checkout, server-side verification, order recording and buyer order history | USD test checkout; no real fulfillment |
| Seller workspace | Create listings with price/stock/images and change listing status | Editing saved listings is not implemented; analytics and reputation include seeded demo counters |
| Messaging | Buyer–seller conversations and Supabase Realtime messages | Requires configured Auth, database policies and Realtime |
| Seller directory | Search, filters, sorting, profiles and store views | Review summaries/excerpts are seeded; no complete post-purchase review workflow |
| Interface | Responsive grids/carousels, edge fades, shared Hero transitions and hover previews | Preview playback depends on viewport, input device and visibility |
| Localization | Locale routing and message files for 19 languages via next-intl | Translation coverage is being refined; currency selection is not live FX conversion |

KYC, administrator permissions, seller payouts and cashback are not implemented
end-to-end. Screens and labels suggesting those features are prototype UI.

## Technical approach

- **Next.js 16 App Router:** server-rendered catalog reads, interactive client
  components, API route handlers and locale-based routes.
- **React 19 + TypeScript:** strict type checking, Context providers for session
  and cart state.
- **Supabase:** PostgreSQL, Auth, Storage and Realtime. The schema includes RLS
  and column-level access restrictions.
- **Stripe:** test-mode checkout with server-side verification and deterministic
  order identifiers for retry handling.
- **Tailwind CSS 4:** responsive styling with Base UI/Radix primitives.
- **Vitest + Testing Library:** unit and component/integration tests for auth,
  cart behavior, catalog queries, seller listings, chat and payments.
- **Deployment:** OpenNext and Wrangler configuration for Cloudflare Workers.

```text
app/
  [locale]/
    (auth)/                 Login and signup
    (main)/
      layout.tsx            Shared navigation, Hero slot, footer and providers
      page.tsx              Homepage
      direct-top-up/        Top-up index and game detail routes
      account/              Account and seller dashboard
      user/                 Seller directory and profiles
    (checkout)/             Product and checkout routes
  api/                      Auth, listing and payment handlers
components/                 UI and feature components
contexts/                   Auth and cart providers
hooks/                      Preview, visibility and interaction hooks
lib/                        Catalog queries, validation and payment logic
i18n/ + messages/           Locale routing and translations
supabase/                   Schema, guides and explicit seed scripts
.github/workflows/ci.yml    Automated quality checks
```

`MarketplaceHero` stays mounted in the shared main layout between the homepage
and top-up route. This preserves the tab indicator transition and carousel state;
other routes do not render the Hero.

## Run locally

Use **Node.js 24** (see `.nvmrc`) and npm. Next.js requires Node 20.9 or newer;
Node 24 matches this project's CI and local validation environment.

```sh
git clone https://github.com/gh-phduy/gaming-marketplace.git
cd gaming-marketplace
npm ci
```

Copy [.env.example](.env.example) to `.env.local` and supply your own Supabase
project values and Stripe **test** keys. Public Supabase/Stripe keys are embedded
in browser bundles; service-role and Stripe secrets stay server-side.

1. Apply [supabase/setup.sql](supabase/setup.sql) in the Supabase SQL Editor.
   Follow [supabase/README.md](supabase/README.md) for schema, RLS and Realtime.
2. Configure Auth redirect URLs and email confirmation for your origin. See
   [supabase/auth-redirect-urls.txt](supabase/auth-redirect-urls.txt).
3. Follow the prerequisites in [supabase/seed-demo.sql](supabase/seed-demo.sql)
   and [supabase/homepage-sections.sql](supabase/homepage-sections.sql) to prepare
   sample catalog data. Seller/asset provisioning is described in
   [supabase/seller-setup.md](supabase/seller-setup.md).
4. Follow [supabase/payment-setup.md](supabase/payment-setup.md) to configure
   Stripe test checkout and the `/api/payments/webhook` signing secret.

```sh
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en). Database-dependent
screens require the configured schema and data; the environment template is
not a working backend. Seed commands write to your configured project and must
be run intentionally, not as part of installation or CI.

For a production Next.js server:

```sh
npm run build:next
npm start
```

No public demo URL is listed yet. Add a tested hosted URL after deployment and
the main buyer/seller flows have been verified.

## Quality checks

```sh
npm run lint
npm run typecheck
npm test
npm run build:next
```

`typecheck` generates Next.js route types before `tsc --noEmit`, so it works in
a fresh checkout. `npm run test:coverage` generates a V8 coverage report; there
is no enforced coverage threshold or browser E2E suite configured.

ESLint uses the native Next.js flat configs. Lint errors fail the check.
Existing `any`, unused-variable, image/accessibility and React Compiler migration
findings remain visible as warnings. React Compiler is not enabled; these
warnings are technical debt, not a claim that every lint finding is fixed.
CommonJS imports are permitted in the Node provisioning scripts.

[CI](.github/workflows/ci.yml) runs on pushes and pull requests, or manually.
It installs from `package-lock.json`, runs lint, route/type checks, the full
Vitest suite and a production **Next.js** build on Ubuntu with Node 24.
Public placeholders let CI run without Supabase/Stripe secrets. It runs no
database seeds or deployments. Check the Actions tab after pushing to see the
first actual GitHub run; local checks do not prove hosted CI has passed.

## Cloudflare deployment

The configured deployment target is Cloudflare Workers:

```sh
npm run build
npm run check:cloudflare
npm run preview
```

`build` produces the OpenNext Worker bundle; `build:next` produces the Next.js
application. CI checks the latter. Worker packaging and Wrangler validation
remain separate deployment checks.

See [CLOUDFLARE.md](CLOUDFLARE.md) for build variables, runtime secrets and
deployment instructions. Deploy explicitly with `npm run deploy` after
configuring your own Cloudflare account and project.

## Follow-up work

- Replace demo review metadata with a review table and post-purchase review flow.
- Finish translation coverage and remove remaining lint warnings.
- Add browser E2E tests for navigation, checkout and listing management.
- Verify hosted flows before publishing a demo link.
