import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPopularSellers } from "./popular-sellers";

vi.mock("next/cache", () => ({
  unstable_cache: (load: () => unknown) => load,
}));

const fixtures = vi.hoisted(() => ({
  products: [] as Record<string, unknown>[],
  users: [] as Record<string, unknown>[],
  fail: false,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => {
      let rows = [
        ...(table === "products" ? fixtures.products : fixtures.users),
      ];
      const query = {
        select: () => query,
        eq: (key: string, value: unknown) => {
          rows = rows.filter((row) => row[key] === value);
          return query;
        },
        in: (key: string, values: unknown[]) => {
          rows = rows.filter((row) => values.includes(row[key]));
          return query;
        },
        order: () => query,
        range: (start: number, end: number) => {
          rows = rows.slice(start, end + 1);
          return query;
        },
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({
            data: rows,
            error: fixtures.fail ? { message: "offline" } : null,
          }).then(resolve),
      };
      return query;
    },
  }),
}));

beforeEach(() => {
  fixtures.products = [];
  fixtures.users = [];
  fixtures.fail = false;
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
});
afterEach(() => vi.unstubAllEnvs());

function addSeller(id: string, count: number, rating = 0) {
  fixtures.users.push({
    id,
    display_name: id,
    avatar_url: "/avt-placeholder.jpg",
    rating,
    is_verified_seller: false,
  });
  for (let i = 0; i < count; i++)
    fixtures.products.push({
      id: `${id}-${i}`,
      seller_id: id,
      status: "published",
    });
}

describe("popular seller ranking", () => {
  it("returns only the top 10 by published product count, independent of ratings and verification", async () => {
    for (let i = 1; i <= 12; i++)
      addSeller(`seller-${String(i).padStart(2, "0")}`, i, i === 1 ? 5 : 0);
    fixtures.products.push(
      { id: "draft", seller_id: "seller-01", status: "draft" },
      { id: "paused", seller_id: "seller-01", status: "paused" },
    );
    const result = await getPopularSellers();
    expect(result).toHaveLength(10);
    expect(result.map((seller) => seller.productCount)).toEqual([
      12, 11, 10, 9, 8, 7, 6, 5, 4, 3,
    ]);
    expect(result[0]).toMatchObject({
      id: "seller-12",
      rating: 0,
      is_verified_seller: false,
    });
  });
  it("counts beyond the default 1000-row response limit", async () => {
    addSeller("seller-a", 1001);
    addSeller("seller-b", 5);
    expect(
      (await getPopularSellers()).map((seller) => seller.productCount),
    ).toEqual([1001, 5]);
  });
  it("breaks ties consistently and excludes buyers with no products", async () => {
    addSeller("seller-b", 4);
    addSeller("buyer", 0);
    addSeller("seller-a", 4);
    expect((await getPopularSellers()).map((seller) => seller.id)).toEqual([
      "seller-a",
      "seller-b",
    ]);
  });
  it("returns an empty list without mock sellers when the catalog is empty", async () => {
    expect(await getPopularSellers()).toEqual([]);
  });
  it("reports database failures instead of fabricating sellers", async () => {
    fixtures.fail = true;
    await expect(getPopularSellers()).rejects.toThrow("offline");
  });
});
