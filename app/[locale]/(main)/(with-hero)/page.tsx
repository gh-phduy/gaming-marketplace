/**
 * Home Page
 *
 * Main landing page của Difmark marketplace
 * Bao gồm tất cả các sections: Games, Sellers, News, etc.
 * HeroCarousel được render bởi (with-hero)/layout.tsx
 */

import PopularGamesSection from "@/components/home/PopularGamesSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import PromoBanner from "@/components/home/PromoBanner";
import UpcomingGamesSection from "@/components/home/UpcomingGamesSection";
import CategoryGridRow1 from "@/components/home/CategoryGridRow1";
import CategoryGridRow2 from "@/components/home/CategoryGridRow2";
import PopularSellersSection from "@/components/home/PopularSellersSection";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import HomeScrollRestoration from "@/components/home/HomeScrollRestoration";
import GamesSection from "@/components/shared/GamesSection";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import PlatformsSection from "@/components/home/PlatformsSection";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import { getTranslations } from "next-intl/server";
import { getHomepageProducts } from "@/lib/homepage-products";
import { getPopularSellers } from "@/lib/popular-sellers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [t, products, sellers] = await Promise.all([
    getTranslations("home"),
    getHomepageProducts(),
    getPopularSellers(),
  ]);
  return (
    <>
      <HomeScrollRestoration />
      <main
        id="main-content"
        className="mt-8 flex w-full flex-col items-center gap-y-16 pb-8"
      >
        {/* Popular Games Section */}
        <PopularGamesSection games={products.popular} />

        {/* Features Section */}
        <FeaturesSection />

        {/* Upcoming Games Section */}
        <UpcomingGamesSection games={products.upcoming} />

        {/* Category Grid Row 1 */}
        <CategoryGridRow1 />

        {/* Popular Sellers Section */}
        <PopularSellersSection sellers={sellers} />

        {/* Category Grid Row 2 */}
        <CategoryGridRow2 />

        {/* Category Carousel (Mobile) */}
        <CategoryCarousel />

        {/* New on Difmark */}
        <GamesSection title={t("newOnDifmark")} sectionType="new" games={products.new} />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Weekly Chart */}
        <GamesSection title={t("weeklyChart")} sectionType="weekly" games={products.weekly} />

        {/* Flash Sale Section */}
        <FlashSaleSection />

        {/* Under $100 */}
        <GamesSection title={t("under100")} sectionType="under" games={products.under} />

        {/* Platforms Section */}
        <PlatformsSection />

        {/* Latest News Section */}
        <LatestNewsSection />
      </main>
    </>
  );
}
