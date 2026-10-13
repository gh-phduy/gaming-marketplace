"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  HERO_GRID_COLUMNS_WITH_SIDE_BANNER,
} from "./hero-carousel/config";
import { HeroCategoryTiles } from "./hero-carousel/HeroCategoryTiles";
import { HeroSideBanners } from "./hero-carousel/HeroSideBanners";
import { HeroSlides } from "./hero-carousel/HeroSlides";
import { HeroTabs } from "./hero-carousel/HeroTabs";
import type { HeroTab } from "./hero-carousel/types";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

interface HeroCarouselProps {
  activeTab: HeroTab;
}

/* ==========================================================================
   MAIN COMPONENT: HeroCarousel
   ========================================================================== */

/**
 * HeroCarousel Component
 *
 * Renders the top hero section of the home page.
 * Composes navigation tabs, image slides, side call-to-action banners,
 * and category tiles. Features dynamic height adjustments to transition
 * smoothly when switching between tabs with different content layouts.
 */
export function HeroCarousel({ activeTab }: HeroCarouselProps) {
  const t = useTranslations("home");
  
  // Grid layout columns configurations
  const gridColumnsClass = `grid-cols-1 ${HERO_GRID_COLUMNS_WITH_SIDE_BANNER}`;
  
  // Compute height adaptively based on the active tab's media requirements
  const mediaRowHeightClass =
    activeTab === "digital"
      ? "h-auto min-[700px]:h-[270px] 1200:h-[310px] 1640:h-[371px] 1920:h-[451px]"
      : "h-auto min-[700px]:h-[164px] 1200:h-[206px] 1640:h-[225px] 1920:h-[274px]";

  return (
    <div className="relative flex w-full justify-center py-8">
      {/* Background Graphic */}
      <Image
        src="/bg-hero-carousel.jpg"
        alt=""
        fill
        sizes="100vw"
        fetchPriority="high"
        loading="eager"
        className="object-cover object-center"
        aria-hidden="true"
      />
      
      <div className="relative z-10">
        <div className="mx-auto w-full">
          {/* Navigation Category Tabs */}
          <HeroTabs activeTab={activeTab} />

          {/* Heading Text Header */}
          <div className="mb-6 px-4 text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-wide text-white uppercase md:text-4xl">
              {activeTab === "digital"
                ? t("thousandsOfDigitalProducts")
                : t("topUpGamesAndServicesInstantly")}
            </h1>
            <p className="mx-auto max-w-3xl text-sm text-gray-300 md:text-base">
              {activeTab === "digital"
                ? t("discoverAVastSelection")
                : t("instantlyTopUpYourFavorite")}
            </p>
          </div>

          {/* Slider & Banners Frame Container */}
          <div className="p-6 990:rounded-3xl 990:border 990:border-white/5 990:bg-[#0a0a0b]/20 990:p-3 990:shadow-2xl 990:backdrop-blur-sm 1200:p-6">
            <div
              className={`mb-4 grid gap-4 overflow-hidden rounded-3xl transition-[height] duration-300 ease-linear lg:justify-center ${gridColumnsClass} ${mediaRowHeightClass}`}
            >
              {/* Main Slides */}
              <HeroSlides activeTab={activeTab} />
              
              {/* Side Banners (hidden on mobile/tablets) */}
              <div className="hidden h-full 1100:block">
                <HeroSideBanners activeTab={activeTab} />
              </div>
            </div>

            {/* Quick Navigation Category Tiles */}
            <div>
              <HeroCategoryTiles activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

