"use client";

import ResponsiveGameList from "./ResponsiveGameList";
import GameCard from "./GameCard";
import SectionHeader from "./SectionHeader";
import { useTranslations } from "next-intl";
import type { HomepageGame } from "@/lib/homepage-products";
import { getHomepageGamePreviewVideo } from "@/lib/game-preview-video";
import { useCart } from "@/contexts/CartContext";

interface GamesProps {
  title: string;
  sectionType: "new" | "weekly" | "under";
  games: HomepageGame[];
}

export default function Games({ title, sectionType, games }: GamesProps) {
  const t = useTranslations("home");
  const { addToCart } = useCart();

  return (
    <section
      className="w-full responsive px-8 800:px-0"
      aria-labelledby={`games-section-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <SectionHeader
        headingId={`games-section-${title.toLowerCase().replace(/\s+/g, "-")}`}
        headingText={title}
        title={title}
        titleClassName="-translate-x-[22px]"
        actionText={t("viewAll")}
        viewAllHref={
          sectionType === "new"
            ? "/product?sort=newer"
            : sectionType === "weekly"
              ? "/product?sort=popular"
              : "/product"
        }
        viewAllAriaLabel={`View all ${title.toLowerCase()}`}
      />

      <ResponsiveGameList label={`${title} games`} layout="columns">
        {games.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            title={game.title}
            platform={game.platform}
            price={`${game.currency}${Number(game.price).toFixed(2)}`}
            coverImage={game.image_url}
            previewVideo={getHomepageGamePreviewVideo(game)}
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
            sellerName={game.seller?.display_name || "Unknown Seller"}
            sellerAvatar={game.seller?.avatar_url || "/avt1.png"}
            sellerRank={
              (game.seller?.rating ?? 0) >= 4.9 ? "🦄 Legendary" : "⭐ Verified"
            }
          />
        ))}
      </ResponsiveGameList>
    </section>
  );
}
