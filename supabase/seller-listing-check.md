# Seller listing check — 12 October 2026

The seller dashboard was verified with the dedicated `Stripe Test Buyer` account.
Its two test listings have been left **paused** so they do not appear in the public catalog.

Verified through the browser and hosted Supabase:

- Upload a JPG cover to public bucket `Image`, under `seller_listings/<auth-user-id>/`.
  The public image returned HTTP 200. The database stores a URL, not base64 image data.
- Save a draft, publish it, reload the dashboard, and pause it.
- Publish another product directly with **Publish now**.
- Persist currency `USD`, category `game-keys`, stock, price, edition and delivery.
- Show the uploaded cover, chosen edition/delivery and the seller's description on
  the public product page. The unrelated Battlefield text was removed.
- Hide paused products from anonymous catalog queries. Publishing sets `is_new=true`;
  drafts/paused products set it to false.

`product-listing-fields.sql` was applied to the hosted project. Fresh installations
and reruns of `setup.sql` now include `edition` and `delivery`.

Product mutations check the current Supabase user, match the seller ID, and retain
RLS. Missing rows and database errors do not masquerade as successful writes.
Save/upload buttons prevent duplicate clicks; stale refreshes cannot replace a
newer local save. Image uploads require authentication, accept JPG/PNG/WebP/GIF,
check file signatures and enforce the 2.5 MB limit.

Validation: 19 seller/upload tests and 90 PostgreSQL schema checks passed.
Related payment, notification and homepage tests also passed. Global TypeScript
checking still reports the existing Next.js declaration and unrelated test errors.

## Windows dev server

The reported EPERM rename error was not reproduced during subsequent dashboard
and product page checks. `npm run dev` now selects Webpack as a development workaround.
The existing running process still uses Turbopack until it is restarted.

Automatic approval review blocked stopping the process and removing `.next/dev`,
without a detailed reason. Neither action was performed. In the terminal running
the website, press Ctrl+C, then run `npm run dev` to apply the new command.
This workaround does not establish the exact cause of the intermittent file lock.

References: [Next.js dev options](https://nextjs.org/docs/app/api-reference/cli/next#next-dev-options),
[Supabase Storage upload](https://supabase.com/docs/reference/javascript/storage-from-upload).
