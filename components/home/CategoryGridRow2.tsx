/**
 * CategoryGridRow2 Component
 *
 * Desktop grid for second 2 category cards (Gift Cards, Software)
 */

import { CategoryCard } from "../shared/CategoryCard";
import { useTranslations } from "next-intl";

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * CategoryGridRow2 Component
 *
 * Desktop-only grid showing second row of category cards
 */
export default function CategoryGridRow2() {
  const t = useTranslations("home");

  const categoryCards = [
    {
      id: 3,
      title: t("giftCards"),
      description: t("giftCardsDesc"),
      productCount: `14937 ${t("products")}`,
      bgImage: "/bg-hero3.webp",
      heroImage: "/hero_3.webp",
      gradientColor: "to-green-500/10",
      href: "/buy-gift-cards",
    },
    {
      id: 4,
      title: t("software"),
      description: t("softwareDesc"),
      productCount: `964 ${t("products")}`,
      bgImage: "/bg-hero4.webp",
      heroImage: "/hero_4.webp",
      gradientColor: "to-red-500/10",
      href: "/buy-software",
    },
  ];

  return (
    <section
      className="800:flex hidden flex-col gap-y-10 w-full 800:px-0 px-8 responsive"
      aria-label="Product Categories - Row 2"
    >
      <div className="flex justify-between gap-x-8 w-full">
        {categoryCards.map((card) => (
          <CategoryCard key={card.id} data={card} />
        ))}
      </div>
    </section>
  );
}
