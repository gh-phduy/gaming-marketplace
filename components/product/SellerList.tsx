import { supabase } from "@/lib/supabase";
import SellerFilterBar from "./SellerFilterBar";
import { SellerOffer } from "./SellerRow";
import SellerListClient from "./SellerListClient";
import { getTranslations } from "next-intl/server";
import { listingCategories } from "@/lib/seller-listing";

async function getSellers(
  productTitle?: string,
): Promise<SellerOffer[] | null> {
  try {
    let query = supabase
      .from("products")
      .select(
        `
        *,
        seller:users (
          id,
          display_name,
          avatar_url,
          rating,
          is_verified_seller
        )
      `,
      )
      .eq("status", "published");

    if (productTitle) {
      query = query.eq("title", productTitle);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching sellers from Supabase:", error);
      return null;
    }

    return (data || []).map(
      (row: any): SellerOffer => ({
        data: {
          id: row.id,
          type:
            Object.keys(listingCategories).find(
              (label) => listingCategories[label] === row.category,
            ) || row.category,
          platform: row.platform || "PC",
          edition: row.edition || "Standard",
          activationRegion: row.region,
          price: Number(row.price),
          currency: row.currency,
          title: row.title || "Game Key",
          image_url: row.image_url || "/cyberpunk_2077.jpg",
        },
        seller: {
          id: row.seller?.id || "unknown",
          name: row.seller?.display_name || "Unknown Seller",
          avatar: row.seller?.avatar_url || "/avt1.png",
          isOnline: false,
          isVerified: Boolean(row.seller?.is_verified_seller),
          tier: row.seller?.is_verified_seller ? "Verified Seller" : "Seller",
          rating: Number(row.seller?.rating ?? 0),
        },
      }),
    );
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return null;
  }
}

interface SellerListProps {
  productTitle?: string;
}

export default async function SellerList({ productTitle }: SellerListProps) {
  const products = await getSellers(productTitle);
  const t = await getTranslations("product");

  if (products === null) {
    return (
      <div className="flex w-full flex-col gap-y-2">
        <SellerFilterBar />
        <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
          {t("failedToLoad")}
        </div>
      </div>
    );
  }

  return <SellerListClient initialOffers={products} />;
}
