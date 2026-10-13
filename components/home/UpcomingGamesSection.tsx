"use client";

import ResponsiveGameList from "../shared/ResponsiveGameList";
import UpcomingGameCard from "./UpcomingGameCard";
import { useFormatter, useTranslations } from "next-intl";
import SectionHeader from "../shared/SectionHeader";
import type { HomepageGame } from "@/lib/homepage-products";
import { getHomepageGamePreviewVideo } from "@/lib/game-preview-video";
import { getUpcomingReleaseDate } from "@/lib/upcoming-release-dates";
import { useCart } from "@/contexts/CartContext";

export default function UpcomingGamesSection({
  games,
}: {
  games: HomepageGame[];
}) {
  const t = useTranslations("home");
  const { addToCart } = useCart();
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
      <ResponsiveGameList label={t("upcomingGamesAria")} layout="columns">
        {games.map((game) => (
          <UpcomingGameCard
            key={game.id}
            id={game.id}
            title={game.title}
            price={`${game.currency}${Number(game.price).toFixed(2)}`}
            coverImage={game.image_url}
            previewVideo={getHomepageGamePreviewVideo(game)}
            platform={game.platform}
            releaseDate={formatReleaseDate(getUpcomingReleaseDate(game))}
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
