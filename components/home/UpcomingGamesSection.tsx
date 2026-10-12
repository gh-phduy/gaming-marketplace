"use client";

import ProductCarousel from "../product/ProductCarousel";
import UpcomingGameCard from "./UpcomingGameCard";
import { useFormatter, useTranslations } from "next-intl";
import SectionHeader from "../shared/SectionHeader";
import type { HomepageGame } from "@/lib/homepage-products";

export default function UpcomingGamesSection({
  games,
}: {
  games: HomepageGame[];
}) {
  const t = useTranslations("home");
  const format = useFormatter();
  const formatReleaseDate = (date: string | null) =>
    date
      ? format.dateTime(new Date(`${date}T00:00:00Z`), {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      : undefined;

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
      <div className={visibilityClass}>
        {colGames.map((game) => (
          <UpcomingGameCard
            key={game.id}
            id={game.id}
            title={game.title}
            price={`${game.currency}${Number(game.price).toFixed(2)}`}
            coverImage={game.image_url}
            previewVideo={game.video_url || undefined}
            platform={game.platform}
            releaseDate={formatReleaseDate(game.release_date)}
          />
        ))}
      </div>
    );
  };

  return (
    <section
      className="w-full responsive px-8 800:px-0"
      aria-labelledby="upcoming-games-heading"
    >
      <SectionHeader
        headingId="upcoming-games-heading"
        headingText={t("upcomingGamesHeading")}
        title={t("upcomingGamesTitle")}
        titleClassName="-translate-x-[22px]"
        actionText={t("viewAll")}
        viewAllHref="/product"
        viewAllAriaLabel={
          t.has("viewAllUpcomingGames")
            ? t("viewAllUpcomingGames")
            : t("viewAll")
        }
      />
      <div
        className="mt-10 hidden grid-cols-1 gap-4 800:grid 990:grid-cols-3 1920:grid-cols-4"
        role="list"
        aria-label={t("upcomingGamesAria")}
      >
        {renderColumn(0)}
        {renderColumn(1)}
        {renderColumn(2)}
        {renderColumn(3)}
      </div>
      <div className="block 800:hidden">
        <ProductCarousel>
          {games.map((game) => (
            <UpcomingGameCard
              key={game.id}
              id={game.id}
              title={game.title}
              price={`${game.currency}${Number(game.price).toFixed(2)}`}
              coverImage={game.image_url}
              previewVideo={game.video_url || undefined}
              platform={game.platform}
              releaseDate={formatReleaseDate(game.release_date)}
            />
          ))}
        </ProductCarousel>
      </div>
    </section>
  );
}
