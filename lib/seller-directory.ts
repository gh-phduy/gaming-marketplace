import type { SellerProfile } from "@/components/user/seller-profile.data";

export interface DirectorySeller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  sales: number;
  tier: string;
  location: string;
  verified: boolean;
  categories: string[];
  sampleStats: boolean;
}

// All metrics come from the stored Supabase seller profile and product counters.
export function toDirectorySeller(profile: SellerProfile): DirectorySeller {
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    rating: profile.rating,
    reviews: profile.totalFeedbacks,
    sales: profile.totalSales,
    tier: profile.tier,
    location: profile.location,
    verified: profile.badge === "Verified Seller",
    categories: [...new Set(profile.offers.map((offer) => offer.data.type))],
    sampleStats: profile.reviews.some((review) =>
      review.id.startsWith("demo-"),
    ),
  };
}
