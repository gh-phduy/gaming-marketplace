// Server-only: reads the demo review data provisioned in Supabase Auth app_metadata.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type {
  SellerProfile,
  SellerReview,
} from "@/components/user/seller-profile.data";

export async function withStoredSellerActivity(
  profiles: SellerProfile[],
): Promise<SellerProfile[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !profiles.length) return profiles;
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return Promise.all(
    profiles.map(async (profile) => {
      const { data, error } = await admin.auth.admin.getUserById(profile.id);
      if (error) {
        console.error("Could not load stored seller activity:", error.message);
        return profile;
      }
      const activity = data.user.app_metadata.marketplace_demo_activity;
      if (!activity || activity.version !== 1) return profile;
      const totalFeedbacks = Number(activity.reviewCount);
      const positiveCount = Number(activity.positiveReviewCount);
      const successRate = totalFeedbacks
        ? Number(((positiveCount / totalFeedbacks) * 100).toFixed(2))
        : 0;
      const reviews: SellerReview[] = Array.isArray(activity.reviews)
        ? activity.reviews
        : [];
      return {
        ...profile,
        totalFeedbacks,
        successRate,
        positiveFeedbacks: successRate,
        negativeFeedbacks: Number((100 - successRate).toFixed(2)),
        reviews,
        offers: profile.offers.map((offer) => ({
          ...offer,
          seller: {
            ...offer.seller,
            totalFeedbacks,
            successRate,
            positiveFeedbacks: successRate,
            negativeFeedbacks: Number((100 - successRate).toFixed(2)),
          },
        })),
      };
    }),
  );
}
