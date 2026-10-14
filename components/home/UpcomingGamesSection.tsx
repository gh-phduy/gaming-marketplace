import HomepageGameList from "../shared/HomepageGameList";
import { getFormatter, getTranslations } from "next-intl/server";
import SectionHeader from "../shared/SectionHeader";
import type { HomepageGame } from "@/lib/homepage-products";
import { getHomepageGamePreviewVideo } from "@/lib/game-preview-video";
import { getUpcomingReleaseDate } from "@/lib/upcoming-release-dates";
import { getHomepageCartItem } from "@/lib/homepage-cart-item";

export default async function UpcomingGamesSection({
  games,
}: {
  games: HomepageGame[];
}) {
  const [t, format] = await Promise.all([
    getTranslations("home"),
    getFormatter(),
  ]);
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
      <HomepageGameList
        variant="upcoming"
        label={t("upcomingGamesAria")}
        layout="columns"
        games={games.map((game) => ({
          item: getHomepageCartItem(game),
          price: `${game.currency}${Number(game.price).toFixed(2)}`,
          previewVideo: getHomepageGamePreviewVideo(game),
          releaseDate: formatReleaseDate(getUpcomingReleaseDate(game)),
        }))}
      />
    </section>
  );
}
