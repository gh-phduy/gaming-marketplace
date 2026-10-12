// Provision the four hero listings for four existing seller Auth accounts.
require("@next/env").loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");
const products = require("../../lib/constants/hero-products.json");
const fs = require("node:fs");
const path = require("node:path");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
async function main() {
  const artifactDir = path.join(process.cwd(), ".codex-artifacts/supabase-validation");
  const accounts = JSON.parse(fs.readFileSync(path.join(artifactDir, "seller-accounts.json"), "utf8"));
  const { data: catalog, error: catalogError } = await db.from("products").select("id,seller_id,status,title")
    .eq("status", "published");
  if (catalogError) throw catalogError;
  const counts = new Map(accounts.map(account => [account.id, catalog.filter(product => product.seller_id === account.id).length]));
  const owners = accounts.toSorted((a, b) => counts.get(a.id) - counts.get(b.id) || a.id.localeCompare(b.id)).slice(0, 4);
  if (owners.length !== 4) throw new Error("Four existing seeded sellers are required");
  const { data: existing, error: existingError } = await db.from("products").select("*").in("id", products.map(p => p.id));
  if (existingError) throw existingError;
  const usedOwners = new Set();
  const rows = [];
  for (const [index, product] of products.entries()) {
    const previous = existing.find(row => row.id === product.id);
    if (previous && (previous.title !== product.title || !accounts.some(account => account.id === previous.seller_id))) {
      throw new Error("Hero product ID already belongs to another listing");
    }
    const sellerId = previous?.seller_id ?? owners[index].id;
    if (usedOwners.has(sellerId)) throw new Error("Each hero product must belong to a different seller");
    usedOwners.add(sellerId);
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Image/hero_carousel/${product.filename}`;
    const image = await fetch(imageUrl, { method: "HEAD" });
    if (!image.ok) throw new Error(`Hero image unavailable: ${product.filename}`);
    rows.push({ id: product.id, seller_id: sellerId, title: product.title, platform: product.platform,
      description: "Demo listing for testing the marketplace UI. Price and stock are sample data; no game key is supplied.",
      price: product.price, currency: "USD", category: "game-keys", region: "Global", edition: "Standard", delivery: "Instant",
      stock: 10, status: "published", image_url: imageUrl, sort_order: 100 + index });
  }
  const backup = path.join(artifactDir, "hero-products-before.json");
  if (!fs.existsSync(backup)) fs.writeFileSync(backup, JSON.stringify(existing, null, 2));
  const { error } = await db.from("products").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
  const { data: confirmed, error: confirmError } = await db.from("products")
    .select("id,title,seller_id,platform,price,image_url,seller:users(display_name)").in("id", products.map(p => p.id));
  if (confirmError || confirmed.length !== 4 || new Set(confirmed.map(p => p.seller_id)).size !== 4) throw new Error("Hero catalog verification failed");
  console.log(JSON.stringify(confirmed));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
