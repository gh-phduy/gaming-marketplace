import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export interface HomepageGame {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string;
  video_url: string | null;
  platform: string;
  release_date: string | null;
  seller: {
    id: string;
    display_name: string;
    avatar_url: string;
    rating: number;
    is_verified_seller: boolean;
  } | null;
}

const SECTION_FLAGS = {
  popular: "is_popular",
  upcoming: "is_upcoming",
  new: "is_new",
  weekly: "is_weekly",
  under: "is_under_price",
} as const;

export const getHomepageProducts = unstable_cache(
  async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key)
      throw new Error("Supabase homepage configuration is missing");

    // Public catalog reads run on the server, independently of browser sessions.
    const client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const sections = Object.keys(
      SECTION_FLAGS,
    ) as (keyof typeof SECTION_FLAGS)[];
    const results = await Promise.all(
      sections.map(async (section) => {
        let query = client
          .from("products")
          .select(
            "id,title,price,currency,image_url,video_url,platform,release_date,seller:users(id,display_name,avatar_url,rating,is_verified_seller)",
          )
          .eq(SECTION_FLAGS[section], true)
          .eq("status", "published")
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });
        if (section === "under")
          query = query.eq("currency", "USD").lt("price", 100);
        const { data, error } = await query.limit(8).returns<HomepageGame[]>();
        if (error)
          throw new Error(`Could not load ${section} games: ${error.message}`);
        return data || [];
      }),
    );

    return Object.fromEntries(
      sections.map((section, index) => [section, results[index]]),
    ) as Record<keyof typeof SECTION_FLAGS, HomepageGame[]>;
  },
  ["homepage-products-v1"],
  { revalidate: 60 },
);
