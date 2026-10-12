"use client";

import ProductCarousel from "../product/ProductCarousel";
import GameCard from "./GameCard";
import SectionHeader from "./SectionHeader";
import { useTranslations } from "next-intl";
import type { HomepageGame } from "@/lib/homepage-products";

interface GamesProps {
  title: string;
  sectionType: "new" | "weekly" | "under";
  games: HomepageGame[];
}

interface GameColumnProps {
  className?: string;
  children: React.ReactNode;
}

function GameColumn({ className = "", children }: GameColumnProps) {
  return <div className={className}>{children}</div>;
}

export default function Games({ title, sectionType, games }: GamesProps) {
  const t = useTranslations("home");

  // Helper to render a column of up to 2 games with custom breakpoint visibility
  const renderColumn = (colIndex: number) => {
    const startIndex = colIndex * 2;
    const colGames = games.slice(startIndex, startIndex + 2);
    if (colGames.length === 0) return null;

    let visibilityClass = "";
    if (colIndex === 1 || colIndex === 2) {
      visibilityClass = "hidden 990:block";
    } else if (colIndex === 3) {
      visibilityClass = "hidden 1920:block";
    }

    return (
      <GameColumn className={visibilityClass}>
        {colGames.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            title={game.title}
            platform={game.platform}
            price={`${game.currency}${Number(game.price).toFixed(2)}`}
            coverImage={game.image_url}
            previewVideo={game.video_url || undefined}
            sellerName={game.seller?.display_name || "Unknown Seller"}
            sellerAvatar={game.seller?.avatar_url || "/avt1.png"}
            sellerRank={
              (game.seller?.rating ?? 0) >= 4.9 ? "🦄 Legendary" : "⭐ Verified"
            }
          />
        ))}
      </GameColumn>
    );
  };

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

      {/* Desktop Grid */}
      <div
        className="mt-10 hidden grid-cols-1 gap-4 800:grid 990:grid-cols-3 1920:grid-cols-4"
        role="list"
        aria-label={`${title} games`}
      >
        {renderColumn(0)}
        {renderColumn(1)}
        {renderColumn(2)}
        {renderColumn(3)}
      </div>

      {/* Mobile Carousel */}
      <div className="block 800:hidden">
        <ProductCarousel>
          {games.map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              title={game.title}
              platform={game.platform}
              price={`${game.currency}${Number(game.price).toFixed(2)}`}
              coverImage={game.image_url}
              previewVideo={game.video_url || undefined}
              sellerName={game.seller?.display_name || "Unknown Seller"}
              sellerAvatar={game.seller?.avatar_url || "/avt1.png"}
              sellerRank={
                (game.seller?.rating ?? 0) >= 4.9
                  ? "🦄 Legendary"
                  : "⭐ Verified"
              }
            />
          ))}
        </ProductCarousel>
      </div>
    </section>
  );
}
