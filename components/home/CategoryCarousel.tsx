/**
 * CategoryCarousel Component
 *
/**
 * CategoryCarousel Component
 *
 * Mobile carousel for category cards
 * Shows all 4 category cards in a swipeable carousel
 */

"use client";

import bgHero1Image from "@/public/bg-hero1.webp";
import hero1Image from "@/public/hero_1.webp";
import bgHero2Image from "@/public/bg-hero2.webp";
import hero2Image from "@/public/hero_2.webp";
import bgHero3Image from "@/public/bg-hero3.webp";
import hero3Image from "@/public/hero_3.webp";
import bgHero4Image from "@/public/bg-hero4.webp";
import hero4Image from "@/public/hero_4.webp";
import ProductCarousel from "../product/ProductCarousel";
import { CategoryCard, CategoryCardData } from "../shared/CategoryCard";
import { useTranslations } from "next-intl";


/* ============================================
   CONSTANTS
   ============================================ */

/** Category cards data */
const getCategoryCards = (t: any): CategoryCardData[] => [
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
  {
    id: 3,
    title: t("giftCards"),
    description: t("giftCardsDesc"),
    productCount: `14937 ${t("products")}`,
    bgImage: bgHero3Image.src,
    heroImage: hero3Image.src,
    gradientColor: "to-green-500/10",
    href: "/buy-gift-cards",
  },
  {
    id: 4,
    title: t("software"),
    description: t("softwareDesc"),
    productCount: `964 ${t("products")}`,
    bgImage: bgHero4Image.src,
    heroImage: hero4Image.src,
    gradientColor: "to-red-500/10",
    href: "/buy-software",
  },
];

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * CategoryCarousel Component
 *
 * Mobile-only carousel for displaying all category cards
 */
export default function CategoryCarousel() {
  const t = useTranslations("home");
  const categoryCards = getCategoryCards(t);

  return (
    <ProductCarousel className="800:px-0 px-8 responsive 800:hidden block">
      {categoryCards.map((card) => (
        <CategoryCard key={card.id} data={card} />
      ))}
    </ProductCarousel>
  );
}
