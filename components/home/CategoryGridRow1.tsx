/**
 * CategoryGridRow1 Component
 *
 * Desktop grid for first 2 category cards (Game Currency, Game Points)
 */

import bgHero1Image from "@/public/bg-hero1.webp";
import hero1Image from "@/public/hero_1.webp";
import bgHero2Image from "@/public/bg-hero2.webp";
import hero2Image from "@/public/hero_2.webp";
import { CategoryCard } from "../shared/CategoryCard";
import { useTranslations } from "next-intl";

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * CategoryGridRow1 Component
 *
 * Desktop-only grid showing first row of category cards
 */
export default function CategoryGridRow1() {
  const t = useTranslations("home");

  const categoryCards = [
    {
      id: 1,
      title: t("gameCurrency"),
      description: t("gameCurrencyDesc"),
      productCount: `155 ${t("products")}`,
      bgImage: bgHero1Image.src,
      heroImage: hero1Image.src,
      gradientColor: "to-blue-500/10",
      href: "/buy-game-currency",
    },
    {
      id: 2,
      title: t("gamePoints"),
      description: t("gamePointsDesc"),
      productCount: `1825 ${t("products")}`,
      bgImage: bgHero2Image.src,
      heroImage: hero2Image.src,
      gradientColor: "to-purple-500/10",
      href: "/buy-game-cards",
    },
  ];

  return (
    <section
      className="800:flex hidden flex-col gap-y-10 w-full 800:px-0 px-8 responsive"
      aria-label="Product Categories - Row 1"
    >
      <div className="flex justify-between gap-x-8 w-full">
        {categoryCards.map((card) => (
          <CategoryCard key={card.id} data={card} />
        ))}
      </div>
    </section>
  );
}
