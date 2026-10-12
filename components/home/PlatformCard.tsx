/**
 * PlatformItem Component
 *
 * Interactive platform card with hover effects
 * Shows gaming platform (PS5, Xbox, etc.)
 */

"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

/* ============================================
   TYPES
   ============================================ */

interface PlatformItemProps {
  /** Platform name */
  name?: string;
  /** Product listing URL with platform filter */
  href?: string;
  /** Background image */
  bgImage?: string;
  /** Hover overlay image */
  hoverImage?: string;
  /** Console image (dark) */
  consoleImageDark?: string;
  /** Console image (light/hover) */
  consoleImageLight?: string;
}

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULTS = {
  name: "PlayStation 5",
  href: "/product?platform=ps5",
  bgImage: "/bg-flatform.png",
  hoverImage: "/hover-fp.svg",
  consoleImageDark: "/ps5-hover.webp",
  consoleImageLight: "/ps5.webp",
} as const;

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * PlatformItem Component
 *
 * Platform card with console image and hover effects
 */
export default function PlatformItem({
  name = DEFAULTS.name,
  href = DEFAULTS.href,
  bgImage = DEFAULTS.bgImage,
  hoverImage = DEFAULTS.hoverImage,
  consoleImageDark = DEFAULTS.consoleImageDark,
  consoleImageLight = DEFAULTS.consoleImageLight,
}: PlatformItemProps) {
  const t = useTranslations("home");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <Link
      href={href}
      className="group relative block responsive-platforms-item-bg cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      aria-label={t("browseProducts", { name })}
    >
      {/* Hover overlay */}
      <div
        className="absolute inset-0 z-20 opacity-0 transition-all duration-1000 ease-linear group-hover:opacity-100"
        aria-hidden="true"
      >
        <Image src={hoverImage} alt="" fill className="object-cover" />
      </div>

      {/* Background */}
      <div className="absolute inset-0 z-10 h-full w-full overflow-hidden rounded-sm">
        <Image
          src={bgImage}
          alt=""
          fill
          className="object-cover"
          aria-hidden="true"
        />

        {/* Platform name */}
        <h3 className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-[20px] font-semibold text-dm-text-primary">
          {name}
        </h3>
      </div>

      {/* Console image container */}
      <div className="absolute left-1/2 z-20 responsive-platforms-item-content -translate-x-1/2 -translate-y-10 transition-transform duration-1000 group-hover:-translate-y-9 group-hover:scale-105">
        {/* Console image - dark (default) */}
        <Image
          src={consoleImageDark}
          alt={t("consoleAlt", { name })}
          fill
          className={`object-contain transition-opacity duration-1000 ${
            isHovered ? "opacity-10" : "opacity-100"
          }`}
          sizes="(max-width: 990px) 155px, (max-width: 1280px) 210px, 290px"
        />

        {/* Console image - light (hover) */}
        <Image
          src={consoleImageLight}
          alt=""
          fill
          className={`object-contain transition-opacity duration-1000 ${
            isHovered ? "opacity-100" : "opacity-10"
          }`}
          aria-hidden="true"
          sizes="(max-width: 990px) 155px, (max-width: 1280px) 210px, 290px"
        />
      </div>
    </Link>
  );
}
