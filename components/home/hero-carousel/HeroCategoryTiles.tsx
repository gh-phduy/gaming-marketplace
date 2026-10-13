import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Monitor, Package, CreditCard, Gamepad2 } from "lucide-react";
import {
  HERO_CATEGORIES,
  TOPUP_CATEGORIES,
  type HeroCategory,
} from "@/lib/constants/hero";
import { SCATTERED_LAYOUTS } from "./scattered-layouts";
import { ScatteredIcons } from "./ScatteredIcons";
import { StackedImages } from "./StackedImages";
import type { HeroTab } from "./types";

/* ==========================================================================
   CONFIGURATIONS & STYLING VARIANTS
   ========================================================================== */

const ICON_MAP = {
  monitor: Monitor,
  "gamepad-2": Gamepad2,
  "credit-card": CreditCard,
  package: Package,
} as const;

interface HeroCategoryTilesProps {
  activeTab: HeroTab;
}

type HeroTileVariant = "digital" | "topup";

type HeroTileVariantConfig = {
  gridClassName: string;
  cardClassName: string;
  imageSizes: string;
  stackedSizes: string;
  contentClassName: string;
  iconWrapperClassName: string;
  titleClassName: string;
};

/**
 * Styling token maps that define layout grid structures, image sizes,
 * and text sizing for the digital keys categories versus the topup sections.
 */
const HERO_TILE_VARIANT_CONFIG: Record<HeroTileVariant, HeroTileVariantConfig> =
  {
    topup: {
      gridClassName: "grid grid-cols-1 gap-4 1100:grid-cols-3",
      cardClassName:
        "group relative h-[134px] w-full overflow-hidden rounded-2xl ring-1 ring-inset ring-white/10 bg-slate-900/40 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.01]",
      imageSizes: "520px",
      stackedSizes: "300px",
      contentClassName:
        "absolute inset-y-0 left-0 z-20 flex flex-col justify-center gap-2 px-4",
      iconWrapperClassName:
        "flex h-8 w-8 items-center justify-center rounded-md bg-white/20 ring-1 ring-white/30 backdrop-blur-md",
      titleClassName:
        "max-w-[62%] text-[9px] min-[700px]:text-[12px] leading-tight font-bold tracking-wide text-white uppercase drop-shadow-lg",
    },
    digital: {
      gridClassName:
        "grid grid-cols-4 gap-2 min-[500px]:grid-cols-2 min-[500px]:gap-4 lg:grid-cols-4",
      cardClassName:
        "group relative h-[86px] overflow-hidden rounded-2xl ring-1 ring-inset ring-white/10 bg-slate-900/40 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.01] min-[500px]:h-[108px] md:h-[120px]",
      imageSizes: "(max-width: 499px) 25vw, (max-width: 1024px) 50vw, 25vw",
      stackedSizes: "(max-width: 1024px) 26vw, 14vw",
      contentClassName:
        "absolute inset-y-0 left-0 z-20 flex flex-col justify-center gap-2 px-3 md:px-4",
      iconWrapperClassName:
        "flex h-7 w-7 items-center justify-center rounded-md bg-white/20 ring-1 ring-white/30 backdrop-blur-md md:h-8 md:w-8",
      titleClassName:
        "max-w-[62%] text-[9px] 600:text-[11px] leading-tight font-bold tracking-wide text-white uppercase drop-shadow-lg md:text-xs",
    },
  };

/* ==========================================================================
   SUBCOMPONENT: HeroCategoryTileCard
   ========================================================================== */

/**
 * HeroCategoryTileCard Component
 *
 * Renders an individual category card overlaying a thumbnail image,
 * category title, platform icons, and scattered floaters or stacked covers
 * based on layout config specifications.
 */
function HeroCategoryTileCard({
  category,
  variant,
}: {
  category: HeroCategory;
  variant: HeroTileVariant;
}) {
  const config = HERO_TILE_VARIANT_CONFIG[variant];
  const IconComponent =
    ICON_MAP[category.icon as keyof typeof ICON_MAP] ?? Monitor;
  const isScattered = category.id in SCATTERED_LAYOUTS;
  const overlayVisibilityClass =
    variant === "digital" ? "hidden min-[500px]:block" : "";

  return (
    <Link
      prefetch={false}
      key={category.id}
      href={category.link}
      className={config.cardClassName}
    >
      <div className="relative h-full w-full">
        {/* Background Banner */}
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover"
          sizes={config.imageSizes}
        />
        <div className="absolute inset-0 bg-black/15" />

        {/* Text Title & Vector Icon Container */}
        <div className={config.contentClassName}>
          <div className={config.iconWrapperClassName}>
            <IconComponent className="h-4 w-4 text-white" />
          </div>
          <span className={config.titleClassName}>{category.title}</span>
        </div>

        {/* 
          Floaters Overlay: Displays either scattered product icons or
          stacked covers on the right edge of the card (only on desktop sizes).
        */}
        {isScattered ? (
          <div className={overlayVisibilityClass}>
            <ScatteredIcons
              categoryId={category.id}
              heroImages={category.heroImages}
              title={category.title}
            />
          </div>
        ) : (
          <div className={overlayVisibilityClass}>
            <StackedImages
              categoryId={category.id}
              heroImages={category.heroImages}
              title={category.title}
              sizes={config.stackedSizes}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

/* ==========================================================================
   MAIN COMPONENT: HeroCategoryTiles
   ========================================================================== */

/**
 * HeroCategoryTiles Component
 *
 * Renders the bottom category strip below the main slide show.
 * Dynamically binds configuration layouts and loads categories based on activeTab.
 */
export function HeroCategoryTiles({ activeTab }: HeroCategoryTilesProps) {
  const isTopup = activeTab === "topup";
  const variant: HeroTileVariant = isTopup ? "topup" : "digital";
  const categories = isTopup ? TOPUP_CATEGORIES : HERO_CATEGORIES;
  const config = HERO_TILE_VARIANT_CONFIG[variant];

  return (
    <div className={config.gridClassName}>
      {categories.map((category) => (
        <HeroCategoryTileCard
          key={category.id}
          category={category}
          variant={variant}
        />
      ))}
    </div>
  );
}

