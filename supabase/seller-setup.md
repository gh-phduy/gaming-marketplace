# Sellers and catalog ownership

Run `node supabase/scripts/seed-sellers.cjs` from the project root to provision ten
Supabase Auth accounts with matching public profiles and distribute the demo
seller's published listings across them. With the current 40-game catalog, each
account receives four listings. Existing buyer accounts and their listings are
excluded. Repeating the command reuses the accounts and redistributes the same
catalog evenly without creating duplicate products.

The script uses `.env.local` server credentials. Generated passwords and the
original ownership snapshot are retained under the ignored
`.codex-artifacts/supabase-validation/` directory. The generated email addresses
use the reserved `.invalid` domain; these are seeded Auth accounts, not real
people. No invitations or other email messages are sent.

Popular Sellers reads public Supabase data on the server. It counts published
products, includes both verified and unverified sellers, orders by count descending
and UUID ascending for ties, and returns at most ten sellers. Empty catalogs have
no mock fallback. Cards show the stored rating and actual product count; profile
links use the account UUID. The seller directory also uses database profiles and
published offers, without injecting static sellers or fabricated review metrics.

Catalog seed SQL may reset demo product ownership. Run the seller provisioning
command again after reseeding the catalog to restore the distribution.

## Hero carousel products

Run `node supabase/scripts/seed-hero-products.cjs` after provisioning the sellers
to create the four listings in `lib/constants/hero-products.json`. Each listing
belongs to a different seeded seller and uses its uploaded `hero_carousel` cover.
The homepage uses the same manifest for slide links, while retaining the existing
desktop and mobile banner artwork. Prices and stock are sample data.

The script checks that the uploaded covers exist before writing, saves existing
rows in the ignored validation directory, and reuses product IDs on subsequent
runs without overwriting edits. The initial catalog now has 44 published listings:
four sellers have five products and six sellers have four.

## Demo platform distribution

Run `node supabase/scripts/balance-demo-platforms.cjs` to preview the platform
plan, then add `--apply` to update the existing 44 demo listings. It assigns
two tags to 22 listings and three tags to the other 22: PC and PS5 each occur
19 times, and PS4, Xbox Series X/S, Xbox One, and Nintendo Switch each occur
18 times. These labels are demo coverage for testing the
catalog and UI; they are not verified game compatibility or sale inventory.
Each homepage game section includes all six platforms. Hero listings retain
their uploaded cover's primary platform, and seller ownership and other fields are
verified unchanged. The original rows are saved in the ignored
`.codex-artifacts/supabase-validation/platform-tags-before.json` snapshot.

The existing `products.platform` text column stores comma-separated tags. The
shared parser supports both legacy single values and arrays, deduplicates
aliases, and preserves the slash in Xbox Series X/S. Each card displays its
individual platform badges, and listing, offer, and seller-store filters match
any tag instead of matching the combined string.
The demo plan uses different platform families on each product, avoiding two
identical PlayStation or Xbox logos on the same card.

The command can be rerun after reseeding the demo catalog. Cards and listing
filters use the same platform normalization; homepage platform links distinguish
PS4 from PS5 and Xbox One from Xbox Series X/S.

## Stored demo seller activity

Run `node supabase/scripts/seed-seller-activity.cjs` after provisioning the demo
sellers. It verifies each account's seed marker and email before updating it.
The command stores ratings and avatar URLs in `public.users`, and distributes
the demo sales baseline across each seller's published `public.products.sales`.
Review counts, positive-review counts, and five sample review excerpts per seller
are stored in Supabase Auth `app_metadata.marketplace_demo_activity`. These are
explicitly demo summaries, not payment orders or a complete review ledger.

`lib/seller-activity.server.ts` reads only that activity namespace using the
server service-role key, then passes public review fields to the directory and
seller profile. The homepage and directory both read `public.users.rating`.
The UI does not generate fallback ratings or sales for unseeded accounts.

A snapshot of prior ratings, avatars, product sales and demo metadata is saved to
`.codex-artifacts/supabase-validation/seller-activity-before.json`. Reruns skip
already seeded activity, preserving later sales and ratings instead of adding
the baseline twice. Local avatar SVG files are recreated on every run.

## Uploaded seller avatars

Run `node supabase/scripts/assign-seller-avatars.cjs` to assign the ten public
images in `Image/avt_user` to the ten provisioned demo sellers in account order.
The script checks each image URL before writing, updates both `users.avatar_url`
and Auth `user_metadata.avatar_url`, and reads both back to verify all ten users.
Prior avatar URLs are saved in the ignored
`.codex-artifacts/supabase-validation/seller-avatars-before.json` snapshot.
