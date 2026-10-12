// Demo platform labels for exercising all six catalog filters; not compatibility data.
require("@next/env").loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
const platforms = require("../../lib/constants/platforms.json");
const heroes = require("../../lib/constants/hero-products.json");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const sections = [
  "is_popular",
  "is_new",
  "is_upcoming",
  "is_weekly",
  "is_under_price",
];
const sectionOf = (row) => sections.find((key) => row[key]) ?? "hero";

async function main() {
  const dir = path.join(process.cwd(), ".codex-artifacts/supabase-validation");
  const accounts = JSON.parse(
    fs.readFileSync(path.join(dir, "seller-accounts.json"), "utf8"),
  );
  const { data: rows, error } = await db
    .from("products")
    .select("*")
    .in(
      "seller_id",
      accounts.map((account) => account.id),
    )
    .eq("status", "published");
  if (error) throw error;
  const products = rows.filter(
    (row) =>
      row.category === "game-keys" &&
      row.description?.startsWith(
        "Demo listing for testing the marketplace UI.",
      ),
  );
  if (products.length !== 44)
    throw new Error(
      "Expected the existing 44 demo listings; review the catalog before redistributing",
    );
  const counts = Object.fromEntries(
    platforms.map((platform) => [platform.value, 0]),
  );
  const quotas = Object.fromEntries(
    platforms.map((platform, index) => [
      platform.value,
      Math.floor(products.length / platforms.length) +
        (index < products.length % platforms.length ? 1 : 0),
    ]),
  );
  const plan = new Map();
  const sectionCounts = new Map();
  const sellerCounts = new Map();
  function add(row, platform) {
    plan.set(row.id, platform);
    counts[platform]++;
    const section = sectionOf(row);
    sectionCounts.set(
      `${section}:${platform}`,
      (sectionCounts.get(`${section}:${platform}`) ?? 0) + 1,
    );
    sellerCounts.set(
      `${row.seller_id}:${platform}`,
      (sellerCounts.get(`${row.seller_id}:${platform}`) ?? 0) + 1,
    );
  }
  for (const row of products) {
    const hero = heroes.find((hero) => hero.id === row.id);
    if (hero) add(row, hero.platform);
    else if (
      row.title === "Grand Theft Auto VI" ||
      row.title === "Marvels Wolverine"
    )
      add(row, "PS5");
    else if (row.title === "Fable Xbox Series") add(row, "Xbox Series X/S");
  }
  const remaining = products
    .filter((row) => !plan.has(row.id))
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        sections.indexOf(sectionOf(a)) - sections.indexOf(sectionOf(b)) ||
        a.id.localeCompare(b.id),
    );
  for (const row of remaining) {
    const section = sectionOf(row);
    const offset = Math.max(0, sections.indexOf(section));
    const available = platforms
      .filter((platform) => counts[platform.value] < quotas[platform.value])
      .toSorted(
        (a, b) =>
          (sectionCounts.get(`${section}:${a.value}`) ?? 0) -
            (sectionCounts.get(`${section}:${b.value}`) ?? 0) ||
          (sellerCounts.get(`${row.seller_id}:${a.value}`) ?? 0) -
            (sellerCounts.get(`${row.seller_id}:${b.value}`) ?? 0) ||
          counts[a.value] / quotas[a.value] -
            counts[b.value] / quotas[b.value] ||
          ((platforms.indexOf(a) + offset) % platforms.length) -
            ((platforms.indexOf(b) + offset) % platforms.length),
      );
    if (!available.length) throw new Error("No remaining platform capacity");
    add(row, available[0].value);
  }
  // Keep the original primary tag, then add one tag to every product and
  // a third tag to alternating products. 110 tags balance to 18–19 per platform.
  const ordered = [...products].sort(
    (a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id),
  );
  const tags = new Map([...plan].map(([id, platform]) => [id, [platform]]));
  const familyOf = (value) =>
    platforms.find((platform) => platform.value === value).family;
  const totalTags = products.length * 2 + Math.ceil(products.length / 2);
  const tagQuotas = Object.fromEntries(
    platforms.map((platform, index) => [
      platform.value,
      Math.floor(totalTags / platforms.length) +
        (index < totalTags % platforms.length ? 1 : 0),
    ]),
  );
  function countTag(row, platform, delta) {
    counts[platform] += delta;
    const section = sectionOf(row);
    sectionCounts.set(
      `${section}:${platform}`,
      (sectionCounts.get(`${section}:${platform}`) ?? 0) + delta,
    );
    sellerCounts.set(
      `${row.seller_id}:${platform}`,
      (sellerCounts.get(`${row.seller_id}:${platform}`) ?? 0) + delta,
    );
  }
  function allocateTag(row, visited = new Set(), reserved = new Set()) {
    if (visited.has(row.id)) return false;
    const nextVisited = new Set([...visited, row.id]);
    const section = sectionOf(row);
    const candidates = platforms
      .filter(
        (p) =>
          !reserved.has(p.value) &&
          !tags.get(row.id).some((tag) => familyOf(tag) === p.family),
      )
      .toSorted(
        (a, b) =>
          (sectionCounts.get(`${section}:${a.value}`) ?? 0) -
            (sectionCounts.get(`${section}:${b.value}`) ?? 0) ||
          counts[a.value] / tagQuotas[a.value] -
            counts[b.value] / tagQuotas[b.value] ||
          (sellerCounts.get(`${row.seller_id}:${a.value}`) ?? 0) -
            (sellerCounts.get(`${row.seller_id}:${b.value}`) ?? 0) ||
          platforms.indexOf(a) - platforms.indexOf(b),
      );
    const direct = candidates.find((p) => counts[p.value] < tagQuotas[p.value]);
    if (direct) {
      tags.get(row.id).push(direct.value);
      countTag(row, direct.value, 1);
      return true;
    }
    // An augmenting path moves an extra tag to free capacity, preserving all
    // primary tags and the exact 18–19 quotas even at the end of the plan.
    for (const platform of candidates) {
      for (const other of ordered) {
        const labels = tags.get(other.id);
        const index = labels.indexOf(platform.value, 1);
        if (index < 1 || nextVisited.has(other.id)) continue;
        labels.splice(index, 1);
        countTag(other, platform.value, -1);
        if (
          allocateTag(
            other,
            nextVisited,
            new Set([...reserved, platform.value]),
          )
        ) {
          tags.get(row.id).push(platform.value);
          countTag(row, platform.value, 1);
          return true;
        }
        labels.splice(index, 0, platform.value);
        countTag(other, platform.value, 1);
      }
    }
    return false;
  }
  for (const round of [
    ordered,
    ordered.filter((_, index) => index % 2 === 0),
  ]) {
    for (const row of round) {
      if (!allocateTag(row))
        throw new Error("No unique platform capacity for extra tag");
    }
  }
  for (const platform of platforms) {
    if (counts[platform.value] !== tagQuotas[platform.value])
      throw new Error("Tag quota verification failed");
  }
  for (const [id, labels] of tags) {
    if (
      ![2, 3].includes(labels.length) ||
      new Set(labels.map(familyOf)).size !== labels.length
    )
      throw new Error("Product tag diversity verification failed");
    plan.set(id, labels.join(", "));
  }
  const changes = products.filter((row) => row.platform !== plan.get(row.id));
  const report = {
    mode: process.argv.includes("--apply") ? "apply" : "preview",
    products: products.length,
    changed: changes.length,
    totalTags,
    tagSizes: Object.fromEntries(
      [2, 3].map((size) => [
        size,
        [...tags.values()].filter((labels) => labels.length === size).length,
      ]),
    ),
    counts,
    sections: Object.fromEntries(
      sections.map((section) => [
        section,
        Object.fromEntries(
          platforms.map((p) => [
            p.value,
            sectionCounts.get(`${section}:${p.value}`) ?? 0,
          ]),
        ),
      ]),
    ),
    assignments: products.map((row) => ({
      id: row.id,
      title: row.title,
      platform: plan.get(row.id),
    })),
  };
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const backup = path.join(dir, "platform-tags-before.json");
  if (!fs.existsSync(backup))
    fs.writeFileSync(backup, JSON.stringify(products, null, 2));
  for (const row of changes) {
    const { data: updated, error } = await db
      .from("products")
      .update({ platform: plan.get(row.id) })
      .eq("id", row.id)
      .eq("seller_id", row.seller_id)
      .eq("platform", row.platform)
      .eq("status", "published")
      .select("id");
    if (error) throw error;
    if (updated.length !== 1)
      throw new Error(`Product changed during redistribution: ${row.id}`);
  }
  const { data: confirmed, error: confirmError } = await db
    .from("products")
    .select("*")
    .in(
      "id",
      products.map((row) => row.id),
    );
  if (confirmError) throw confirmError;
  if (confirmed.length !== products.length)
    throw new Error("Product count changed");
  for (const row of products) {
    const actual = confirmed.find((product) => product.id === row.id);
    if (actual.platform !== plan.get(row.id))
      throw new Error("Platform verification failed");
    // Ownership, pricing, images, and homepage memberships must survive this update.
    for (const key of [
      "seller_id",
      "title",
      "price",
      "currency",
      "stock",
      "image_url",
      "category",
      "status",
      ...sections,
    ]) {
      if (actual[key] !== row[key]) throw new Error(`Unexpected ${key} change`);
    }
  }
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
