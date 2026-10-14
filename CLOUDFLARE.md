# Deploy the marketplace to Cloudflare Workers

This project uses OpenNext to package the existing Next.js application for
Workers and Wrangler to validate/deploy the resulting bundle. Supabase remains
the database and authentication provider.

## Cloudflare Git build settings

Connect `gh-phduy/gaming-marketplace`, branch `main`, and use:

| Setting        | Value                 |
| -------------- | --------------------- |
| Root directory | `/`                   |
| Build command  | `npm run build`       |
| Deploy command | `npx wrangler deploy` |
| Worker name    | `gaming-marketplace`  |

`npm run build` runs OpenNext, which calls `npm run build:next` once and creates
`.open-next/worker.js` and `.open-next/assets`. Do not replace it with a plain
`next build` for a Workers deployment. `wrangler.jsonc` preserves variables
configured in the dashboard between deployments.

Locale routing uses Edge `middleware.ts` for the supported OpenNext path and a
smaller Worker bundle. Next.js 16 logs a deprecation warning for this convention;
it remains supported. Do not rename it to Node `proxy.ts` without checking the
adapter's runtime compatibility and Worker upload size again.

## Environment configuration

Under Worker **Settings > Build > Build variables and secrets**, set these before
building:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Use the existing Supabase project and Stripe test publishable key. Public values
are embedded in the browser bundle, so changing them requires another build.

Under **Settings > Variables and Secrets**, configure the runtime values:

| Name                            | Type     |
| ------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Variable |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Variable |
| `SUPABASE_SERVICE_ROLE_KEY`     | Secret   |
| `STRIPE_SECRET_KEY`             | Secret   |
| `STRIPE_WEBHOOK_SECRET`         | Secret   |

The checkout intentionally accepts Stripe test keys only. Create a test webhook
for `https://gamingmarketplace.click/api/payments/webhook` and use its signing
secret. Never commit private keys or `.env` / `.dev.vars` files. OpenNext can copy
dotenv files into server output; use environment variables for server secrets
when making a deployment build. Generated output must remain gitignored.

## Local validation

```sh
npm ci
npm run build
npm run check:cloudflare
npm run cf:typegen
npm run preview
```

`check:cloudflare` performs a Wrangler dry run without publishing a Worker.
`preview` runs the built app in the Workers runtime. To build plain Next.js for
the existing Node development workflow, use `npm run build:next`.

On Windows, native adapter packages can be blocked by Application Control.
Run installation, build and preview in WSL/Linux with Linux Node.js installed;
do not reuse Windows `node_modules` in WSL. Cloudflare Git builds run on Linux.

To publish from a local terminal after validation:

```sh
npx wrangler login
npm run deploy
```

## Domain and login

After the `workers.dev` deployment works, add `gamingmarketplace.click` in
Worker **Settings > Domains & Routes > Add > Custom Domain**. Remove an old
Vercel CNAME before adding the same hostname as a Custom Domain.

In Supabase **Authentication > URL Configuration**, set the production Site URL
and allow the exact locale redirects used by the app, for example
`https://gamingmarketplace.click/en` and `https://gamingmarketplace.click/vi`.

The worker declares the `IMAGES` binding for Next.js image optimization. Check
Cloudflare Images availability and usage for the account when deploying.

## Homepage and image caching

Homepage HTML and public catalog/seller reads revalidate every 60 seconds.
Configured builds prerender homepage locales using public catalog reads, so a
cold edge can serve build assets immediately. CI builds with placeholder keys
generate locales on their first request instead, without database reads during
build. Dynamic account and checkout pages keep their existing request behavior.

The `postbuild` script copies OpenNext's public prerender cache into the reserved
`cdn-cgi/_next_cache` asset directory for the fallback. Keep this step when
changing the deployment pipeline.

OpenNext uses `cloudflare/incremental-cache.ts`, a writable Workers Cache API
backend with build assets as its initial fallback. Entries are local to an edge
location, may be evicted, and are isolated by build version. New locations or cache
misses regenerate the page. This setup requires no R2 subscription. It supports
time-based ISR; cross-location, on-demand tag invalidation would require a
shared tag cache and purge implementation.

Background revalidation runs at the requesting edge through `WORKER_SELF_REFERENCE`
and `ctx.waitUntil`, with a 25-second timeout and deduplication per isolate.
Different isolates may refresh the same entry concurrently under a burst of
traffic. A shared R2 cache and Durable Object queue would be preferable at higher
traffic volumes; a globally deduplicated queue cannot be used with edge-only
canonical storage because it could skip refreshing another location's entry.

The entry point is `cloudflare/worker.mjs`, which delegates to the generated
OpenNext handler. It adds a source-specific
browser cache policy to successful optimized image responses that have no
existing policy. Named catalog images now use a one-day browser TTL and a
seven-day edge TTL. Avatars keep a one-hour TTL, while listing uploads with unique
UUID filenames use an immutable one-year TTL. It also caches transformations at the edge, using
separate keys for AVIF, WebP and original-format clients. Immutable hashed assets
retain their original policy. Homepage promotional assets use hashed static
imports so replacements get new URLs and can safely keep a one-year TTL.
The hero background is pre-sized WebP served directly from static assets,
avoiding a cold-edge transformation. Regenerate it with
`node scripts/optimize-hero-background.mjs` after editing the original JPEG.
Replacing an unversioned catalog image at the same URL can take up to seven days
to appear; use a new filename for an immediately visible update.

The legacy seller API and username onboarding still reference a separate
backend via `NEXT_PUBLIC_API_URL`. For those flows, configure a public backend
URL at build time and runtime; `localhost:5000` is not a production backend.

References:

- https://opennext.js.org/cloudflare/get-started
- https://opennext.js.org/cloudflare/howtos/env-vars
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
