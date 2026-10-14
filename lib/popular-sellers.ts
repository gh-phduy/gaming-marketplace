import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export type PopularSeller = {
  id: string;
  display_name: string;
  avatar_url: string;
  rating: number;
  is_verified_seller: boolean;
  productCount: number;
};

export const getPopularSellers = unstable_cache(
  async (): Promise<PopularSeller[]> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key)
      throw new Error("Supabase seller configuration is missing");
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Count every published listing, including catalogs beyond Supabase's row limit.
    const counts = new Map<string, number>();
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await client
        .from("products")
        .select("id,seller_id")
        .eq("status", "published")
        .order("id")
        .range(offset, offset + 999);
      if (error)
        throw new Error(
          `Could not load seller product counts: ${error.message}`,
        );
      for (const product of data ?? []) {
        if (product.seller_id)
          counts.set(
            product.seller_id,
            (counts.get(product.seller_id) ?? 0) + 1,
          );
      }
      if (!data || data.length < 1000) break;
    }
    const ranked = [...counts]
      .sort(
        ([idA, countA], [idB, countB]) =>
          countB - countA || idA.localeCompare(idB),
      )
      .slice(0, 10);
    if (!ranked.length) return [];
    const { data, error } = await client
      .from("users")
      .select("id,display_name,avatar_url,rating,is_verified_seller")
      .in(
        "id",
        ranked.map(([id]) => id),
      );
    if (error)
      throw new Error(`Could not load seller profiles: ${error.message}`);
    return ranked.flatMap(([id, productCount]) => {
      const profile = data?.find((profile) => profile.id === id);
      return profile
        ? [{ ...profile, rating: Number(profile.rating ?? 0), productCount }]
        : [];
    });
  },
  ["popular-sellers-v1"],
  { revalidate: 60 },
);
