// Explicit demo seed for accounts created by seed-sellers.cjs. No real payment orders.
require("@next/env").loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const artifactDir = path.join(
  process.cwd(),
  ".codex-artifacts/supabase-validation",
);
const accounts = JSON.parse(
  fs.readFileSync(path.join(artifactDir, "seller-accounts.json"), "utf8"),
);
const snippets = [
  "Fast delivery and the key activated perfectly. Thank you!",
  "Great price, clear instructions, and a smooth purchase.",
  "Helpful seller. My game was ready to play in minutes.",
  "Everything worked as described. Would buy here again.",
  "Delivery took a little longer than expected, but support resolved it.",
];
const reviewers = [
  "PixelExplorer",
  "NightOwlGamer",
  "QuestHunter",
  "ArcadeFan",
  "SteamRider",
];
async function main() {
  const backup = [];
  for (const account of accounts) {
    const { data: auth, error: authError } = await db.auth.admin.getUserById(
      account.id,
    );
    if (authError) throw authError;
    if (
      auth.user.user_metadata.seed !== "marketplace-sellers-v1" ||
      auth.user.email !== account.email
    )
      throw new Error(`Refusing non-demo seller: ${account.id}`);
    const { data: profile, error: profileError } = await db
      .from("users")
      .select("id,display_name,avatar_url,rating")
      .eq("id", account.id)
      .single();
    if (profileError) throw profileError;
    const { data: products, error: productError } = await db
      .from("products")
      .select("id,sales")
      .eq("seller_id", account.id)
      .eq("status", "published")
      .order("id");
    if (productError) throw productError;
    if (!products.length)
      throw new Error(`Demo seller has no listings: ${account.id}`);
    backup.push({
      id: account.id,
      profile,
      products,
      activity: auth.user.app_metadata.marketplace_demo_activity ?? null,
    });
  }
  const backupFile = path.join(artifactDir, "seller-activity-before.json");
  if (!fs.existsSync(backupFile))
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  fs.mkdirSync(path.join(process.cwd(), "public/seller-avatars"), {
    recursive: true,
  });
  for (const entry of backup) {
    const account = accounts.find((account) => account.id === entry.id);
    const seed = Array.from(entry.id).reduce(
      (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
      7,
    );
    const rating = (475 + (seed % 25)) / 100;
    const reviewCount = 120 + (seed % 4200);
    const sales = 1200 + (seed % 48000);
    const slug = account.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const initials = account.name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("");
    const hue = (account.name.charCodeAt(0) * 19) % 360;
    fs.writeFileSync(
      path.join(process.cwd(), `public/seller-avatars/${slug}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="hsl(${hue},45%,38%)"/><stop offset="1" stop-color="#182131"/></linearGradient></defs><circle cx="48" cy="48" r="47" fill="url(#g)" stroke="#ffffff22"/><text x="48" y="57" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="700" font-size="28">${initials}</text></svg>`,
    );
    // A rerun does not reset subsequent activity or add the demo baseline twice.
    if (entry.activity?.version === 1) continue;
    for (let index = 0; index < entry.products.length; index++) {
      const product = entry.products[index];
      const baseline =
        Math.floor(sales / entry.products.length) +
        (index < sales % entry.products.length ? 1 : 0);
      const { error } = await db
        .from("products")
        .update({ sales: Math.max(Number(product.sales), baseline) })
        .eq("id", product.id)
        .eq("seller_id", entry.id);
      if (error) throw error;
    }
    const { error: userError } = await db
      .from("users")
      .update({ rating, avatar_url: `/seller-avatars/${slug}.svg` })
      .eq("id", entry.id);
    if (userError) throw userError;
    const { error: metaError } = await db.auth.admin.updateUserById(entry.id, {
      app_metadata: {
        marketplace_demo_activity: {
          version: 1,
          source: "seed-seller-activity",
          seededAt: new Date().toISOString(),
          reviewCount,
          positiveReviewCount: Math.round(
            reviewCount * (0.974 + (seed % 20) / 1000),
          ),
          reviews: snippets.map((text, index) => ({
            id: `demo-${entry.id}-${index}`,
            author: reviewers[index],
            avatar: "/avt-placeholder.jpg",
            createdAt: `Oct ${12 - index}, 2026`,
            rating: index === 4 ? 4 : 5,
            sentiment: "positive",
            text,
          })),
        },
      },
    });
    if (metaError) throw metaError;
  }
  // Verify using the same public rating and product counters consumed by the UI.
  const result = [];
  for (const account of accounts) {
    const { data: profile, error } = await db
      .from("users")
      .select("display_name,rating,avatar_url")
      .eq("id", account.id)
      .single();
    if (error) throw error;
    const { data: products, error: productError } = await db
      .from("products")
      .select("sales")
      .eq("seller_id", account.id)
      .eq("status", "published");
    if (productError) throw productError;
    const { data: auth, error: authError } = await db.auth.admin.getUserById(
      account.id,
    );
    if (authError) throw authError;
    const activity = auth.user.app_metadata.marketplace_demo_activity;
    if (
      !(
        profile.rating > 0 &&
        activity?.reviewCount > 0 &&
        products.every((product) => product.sales > 0)
      )
    )
      throw new Error("Seed verification failed");
    result.push({
      name: profile.display_name,
      rating: profile.rating,
      reviews: activity.reviewCount,
      sales: products.reduce((sum, product) => sum + product.sales, 0),
    });
  }
  console.log(
    JSON.stringify(
      { verifiedSellers: result.length, sellers: result },
      null,
      2,
    ),
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
