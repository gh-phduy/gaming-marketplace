"use client";

import ProductCarousel from "../product/ProductCarousel";
import SectionHeader from "../shared/SectionHeader";
import PopularGameCard from "./PopularGameCard";
import { useTranslations } from "next-intl";
import type { HomepageGame } from "@/lib/homepage-products";

export default function PopularGamesSection({ games }: { games: HomepageGame[] }) {
  const t = useTranslations("home");

  return (
    <section
      className="w-full responsive px-8 800:px-0"
      aria-labelledby="popular-games-heading"
    >
      {/* Section Header */}
      <SectionHeader
        headingId="popular-games-heading"
        headingText={t("popularGamesHeading")}
        title={t("popularGamesTitle")}
        titleClassName="-translate-x-[22px]"
        actionText={t("viewAll")}
        viewAllHref="/product"
        viewAllAriaLabel={t("viewAllPopularGames")}
      />

      {/* Grid Layout (Desktop >= 800px) */}
      <div
        className="mt-10 hidden grid-cols-1 gap-4 800:grid 990:grid-cols-3 1920:grid-cols-4"
        role="list"
        aria-label={t("popularGamesAria")}
      >
        {games.map((game: any) => (
          <PopularGameCard
            key={game.id}
            id={game.id}
            title={game.title}
            price={`$ ${game.price}`}
            coverImage={game.image_url}
            previewVideo={game.video_url}
            platform={game.platform}
          />
        ))}
      </div>

      {/* Carousel Slider Layout (Mobile/Tablet < 800px) */}
      <div className="block 800:hidden">
        <ProductCarousel>
          {games.map((game: any) => (
            <PopularGameCard
              key={game.id}
              id={game.id}
              title={game.title}
              price={`$ ${game.price}`}
              coverImage={game.image_url}
              previewVideo={game.video_url}
              platform={game.platform}
            />
          ))}
        </ProductCarousel>
      </div>
    </section>
  );
}
