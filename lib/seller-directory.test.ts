import { describe, expect, it } from "vitest";
import { toDirectorySeller } from "./seller-directory";
import type { SellerProfile } from "@/components/user/seller-profile.data";
const profile = {
  id: "demo-id",
  name: "Demo Store",
  avatar: "/avt.jpg",
  rating: 4.82,
  totalFeedbacks: 402,
  totalSales: 27882,
  tier: "Elite",
  location: "Vietnam",
  badge: "Seller",
  offers: [],
  reviews: [{ id: "demo-review" }],
} as unknown as SellerProfile;
describe("stored seller directory metrics", () => {
  it("uses the Supabase profile values without generating replacements", () => {
    expect(toDirectorySeller(profile)).toMatchObject({
      rating: 4.82,
      reviews: 402,
      sales: 27882,
      tier: "Elite",
      sampleStats: true,
    });
  });
  it("keeps zero metrics for an unseeded seller", () => {
    expect(
      toDirectorySeller({
        ...profile,
        rating: 0,
        totalFeedbacks: 0,
        totalSales: 0,
        reviews: [],
      }),
    ).toMatchObject({ rating: 0, reviews: 0, sales: 0, sampleStats: false });
  });
});
