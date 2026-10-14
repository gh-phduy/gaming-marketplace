import SectionHeader from "../shared/SectionHeader";
import HomepageGameList from "../shared/HomepageGameList";
import { getTranslations } from "next-intl/server";
import type { HomepageGame } from "@/lib/homepage-products";
import { getHomepageGamePreviewVideo } from "@/lib/game-preview-video";
import { getHomepageCartItem } from "@/lib/homepage-cart-item";

export default async function PopularGamesSection({
  games,
}: {
  games: HomepageGame[];
}) {
  const t = await getTranslations("home");

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

      <HomepageGameList
        variant="popular"
        label={t("popularGamesAria")}
        games={games.map((game) => ({
          item: getHomepageCartItem(game),
          price: `$ ${game.price}`,
          previewVideo: getHomepageGamePreviewVideo(game),
        }))}
      />
    </section>
  );
}
