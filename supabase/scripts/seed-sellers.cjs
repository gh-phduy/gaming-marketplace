// Explicit provisioning command: creates Auth accounts and redistributes demo listings.
// Credentials and the original ownership snapshot are saved only in ignored artifacts.
require("@next/env").loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");
const { randomBytes } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const names = ["Pixel Vault", "Nova Keys", "Dragon Games", "Neon Market", "Quantum Play",
  "Arcade Hub", "Phoenix Store", "Cosmic Games", "Level Up Shop", "Quest Keys"];
const demoSellerId = "30000000-0000-4000-8000-000000000001";
const artifactDir = path.join(process.cwd(), ".codex-artifacts/supabase-validation");
const accountFile = path.join(artifactDir, "seller-accounts.json");
async function main() {
  fs.mkdirSync(artifactDir, { recursive: true });
  const saved = fs.existsSync(accountFile) ? JSON.parse(fs.readFileSync(accountFile, "utf8")) : [];
  const existing = [];
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    existing.push(...data.users);
    if (data.users.length < 1000) break;
  }
  const accounts = [];
  for (let index = 0; index < names.length; index++) {
    const email = `seller${String(index + 1).padStart(2, "0")}@marketplace.example.invalid`;
    let user = existing.find(user => user.email === email);
    let password = saved.find(account => account.email === email)?.password;
    if (!user) {
      password = randomBytes(32).toString("base64url");
      const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true,
        user_metadata: { display_name: names[index], avatar_url: "/avt-placeholder.jpg", seed: "marketplace-sellers-v1" } });
      if (error) throw error;
      user = data.user;
    }
    accounts.push({ id: user.id, email, password, name: names[index] });
    // Save each successful creation so retries never lose generated credentials.
    fs.writeFileSync(accountFile, JSON.stringify([
      ...saved.filter(account => !accounts.some(current => current.id === account.id)), ...accounts,
    ], null, 2));
    const { error } = await db.from("users").upsert({ id: user.id, email, display_name: names[index],
      avatar_url: "/avt-placeholder.jpg" }, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
  }
  const owners = [demoSellerId, ...accounts.map(account => account.id)];
  const { data: products, error } = await db.from("products").select("id,title,seller_id,status,sort_order")
    .in("seller_id", owners).eq("status", "published").order("title").order("id");
  if (error) throw error;
  const backupFile = path.join(artifactDir, "seller-ownership-before.json");
  if (!fs.existsSync(backupFile)) fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
  for (let index = 0; index < accounts.length; index++) {
    const ids = products.filter((_, position) => position % accounts.length === index).map(product => product.id);
    if (!ids.length) continue;
    const { error } = await db.from("products").update({ seller_id: accounts[index].id }).in("id", ids).in("seller_id", owners);
    if (error) throw error;
  }
  const { data: assigned, error: verificationError } = await db.from("products").select("seller_id")
    .in("seller_id", accounts.map(account => account.id)).eq("status", "published");
  if (verificationError) throw verificationError;
  if (assigned.length !== products.length) throw new Error("Ownership verification failed");
  const result = accounts.map(account => ({ id: account.id, name: account.name,
    products: assigned.filter(product => product.seller_id === account.id).length }));
  if (Math.max(...result.map(r => r.products)) - Math.min(...result.map(r => r.products)) > 1) throw new Error("Distribution is uneven");
  console.log(JSON.stringify({ createdAccounts: accounts.length, assignedProducts: assigned.length, sellers: result }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
