import HomepageGameList from "./HomepageGameList";
import SectionHeader from "./SectionHeader";
import { getTranslations } from "next-intl/server";
import type { HomepageGame } from "@/lib/homepage-products";
import { getHomepageGamePreviewVideo } from "@/lib/game-preview-video";
import { getHomepageCartItem } from "@/lib/homepage-cart-item";

interface GamesProps {
  title: string;
  sectionType: "new" | "weekly" | "under";
  games: HomepageGame[];
}

export default async function Games({ title, sectionType, games }: GamesProps) {
  const t = await getTranslations("home");

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

      <HomepageGameList
        variant="standard"
        label={`${title} games`}
        layout="columns"
        games={games.map((game) => ({
          item: getHomepageCartItem(game),
          price: `${game.currency}${Number(game.price).toFixed(2)}`,
          previewVideo: getHomepageGamePreviewVideo(game),
          sellerName: game.seller?.display_name || "Unknown Seller",
          sellerAvatar: game.seller?.avatar_url || "/avt1.png",
          sellerRank:
            (game.seller?.rating ?? 0) >= 4.9 ? "🦄 Legendary" : "⭐ Verified",
        }))}
      />
    </section>
  );
}
