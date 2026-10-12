"use client";

import PlatformCard from "./PlatformCard";
import ProductCarousel from "../product/ProductCarousel";
import SectionHeader from "../shared/SectionHeader";
import { useTranslations } from "next-intl";

/* ==========================================================================
   PLATFORMS DATA CONSTANTS
   ========================================================================== */

const PLATFORM_ITEMS = [
  {
    id: "playstation-5",
    name: "Playstation 5",
    href: "/product?platform=ps5",
    consoleImageDark: "/ps5-hover.webp",
    consoleImageLight: "/ps5.webp",
  },
  {
    id: "playstation-4",
    name: "Playstation 4",
    href: "/product?platform=ps4",
    consoleImageDark: "/platform-device/ps4-hover.webp",
    consoleImageLight: "/platform-device/ps4.webp",
  },
  {
    id: "pc",
    name: "PC",
    href: "/product?platform=pc",
    consoleImageDark: "/platform-device/pc-hover.webp",
    consoleImageLight: "/platform-device/pc.webp",
  },
  {
    id: "xbox-series-x",
    name: "Xbox series X",
    href: "/product?platform=xbox-series-x",
    consoleImageDark: "/platform-device/xboxX-hover.webp",
    consoleImageLight: "/platform-device/xboxX.webp",
  },
  {
    id: "xbox-one",
    name: "Xbox One",
    href: "/product?platform=xbox-one",
    consoleImageDark: "/platform-device/xboxOne-hover.webp",
    consoleImageLight: "/platform-device/xboxOne.webp",
  },
  {
    id: "nintendo-switch",
    name: "Nintendo Switch",
    href: "/product?platform=nintendo-switch",
    consoleImageDark: "/platform-device/nintendo-hover.webp",
    consoleImageLight: "/platform-device/nintendo.webp",
  },
] as const;

/* ==========================================================================
   MAIN COMPONENT: PlatformsSection
   ========================================================================== */

/**
 * PlatformsSection Component
 * Displays a grid of available console/PC platforms.
 * Uses a media query query toggle: renders a grid layout on desktops (>= 800px)
 * and slides into a carousel slider on mobile/tablets.
 */
export default function PlatformsSection() {
  const t = useTranslations("home");

  return (
    <section
      className="w-full responsive overflow-visible px-8 800:px-0"
      aria-labelledby="platforms-heading"
    >
      {/* Section Title Header */}
      <SectionHeader
        headingId="platforms-heading"
        headingText={t("platformsHeadingText")}
        title={t("platformsTitle")}
        containerClassName="mb-10"
        titleClassName="-translate-x-[22px]"
        viewAllAriaLabel={t("viewAllPlatforms")}
      />

      {/* Desktop Layout Grid (>= 800px) */}
      <div className="hidden grid-cols-2 gap-4 800:grid 990:grid-cols-3 990:gap-6">
        {PLATFORM_ITEMS.map((platform) => (
          <PlatformCard
            key={platform.id}
            name={platform.name}
            href={platform.href}
            consoleImageDark={platform.consoleImageDark}
            consoleImageLight={platform.consoleImageLight}
          />
        ))}
      </div>

      {/* Mobile Layout Carousel (< 800px) */}
      <div className="block overflow-visible 800:hidden">
        <ProductCarousel>
          {PLATFORM_ITEMS.map((platform) => (
            <PlatformCard
              key={platform.id}
              name={platform.name}
              href={platform.href}
              consoleImageDark={platform.consoleImageDark}
              consoleImageLight={platform.consoleImageLight}
            />
          ))}
        </ProductCarousel>
      </div>
    </section>
  );
}
