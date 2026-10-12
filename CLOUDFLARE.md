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

The legacy seller API and username onboarding still reference a separate
backend via `NEXT_PUBLIC_API_URL`. For those flows, configure a public backend
URL at build time and runtime; `localhost:5000` is not a production backend.

References:

- https://opennext.js.org/cloudflare/get-started
- https://opennext.js.org/cloudflare/howtos/env-vars
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
