"use client";

import ResponsiveGameList from "../shared/ResponsiveGameList";
import SectionHeader from "../shared/SectionHeader";
import PopularGameCard from "./PopularGameCard";
import { useTranslations } from "next-intl";
import type { HomepageGame } from "@/lib/homepage-products";
import { getHomepageGamePreviewVideo } from "@/lib/game-preview-video";
import { useCart } from "@/contexts/CartContext";

export default function PopularGamesSection({
  games,
}: {
  games: HomepageGame[];
}) {
  const t = useTranslations("home");
  const { addToCart } = useCart();

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

      <ResponsiveGameList label={t("popularGamesAria")}>
        {games.map((game) => (
          <PopularGameCard
            key={game.id}
            id={game.id}
            title={game.title}
            price={`$ ${game.price}`}
            coverImage={game.image_url}
            previewVideo={getHomepageGamePreviewVideo(game)}
            platform={game.platform}
            onAddToCart={() =>
              addToCart({
                id: game.id,
                name: game.title,
                image: game.image_url,
                platform: game.platform,
                price: Number(game.price),
                currency: game.currency,
              })
            }
          />
        ))}
      </ResponsiveGameList>
    </section>
  );
}
