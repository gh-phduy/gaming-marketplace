/**
 * NewItem Component
 *
 * News article card for the Latest News section
 */

"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { LuClock3 } from "react-icons/lu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useTranslations } from "next-intl";

/* ============================================
   TYPES
   ============================================ */

interface NewsItemProps {
  /** News article image */
  image?: string;
  /** Time ago text */
  timeAgo?: string;
  /** Article title */
  title?: string;
  /** Article excerpt */
  excerpt?: string;
  /** View count */
  views?: number;
  /** Link to full article */
  href?: string;
  /** Fill the available column on the news listing page. */
  fluid?: boolean;
}

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULTS = {
  image: "/bg-hero1.webp",
  timeAgo: "8 days ago",
  title:
    "The Witcher 4 Unveiled: First Look Confirms Kovir Setting, Manticore Hunt, and 60 FPS Target on Consoles",
  excerpt:
    "CD Projekt Red returned to Epic Games' annual State of Unreal showcase with a spellbinding tech demo for The Witcher 4, revealing the series' next chapter will send players north to the mineral-rich k",
  views: 2398,
} as const;

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * NewsItem Component
 *
 * Card displaying a news article with image, title, excerpt, and view count
 */
export default function NewsItem({
  image = DEFAULTS.image,
  timeAgo = DEFAULTS.timeAgo,
  title = DEFAULTS.title,
  excerpt = DEFAULTS.excerpt,
  views = DEFAULTS.views,
  href,
  fluid = false,
}: NewsItemProps) {
  const t = useTranslations("home");

  const cardClassName = `bg-surface-card gap-y-2 flex min-w-0 flex-col ${fluid ? "w-full" : "w-fit"} rounded-sm p-5 transition-colors hover:bg-state-hover cursor-pointer focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none`;
  const textWidth = fluid
    ? ""
    : "max-w-[305px] 970:max-w-[253px] 1200:max-w-[320px] 1640:max-w-[376px] 1920:max-w-[335px]";

  const cardContent = (
    <>
      {/* Article Image */}
      <div
        className={`relative overflow-hidden rounded-lg ${fluid ? "aspect-[16/9] w-full" : "h-[174px] w-[305px] 970:w-[253px] 1200:w-[320px] 1640:w-[376px] 1920:w-[335px]"}`}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes={
            fluid
              ? "(max-width: 800px) 100vw, (max-width: 1200px) 50vw, (max-width: 1920px) 33vw, 375px"
              : "(max-width: 970px) 305px, (max-width: 1200px) 253px, (max-width: 1640px) 320px, 376px"
          }
        />
      </div>

      {/* Time Ago */}
      <div className="flex items-center gap-x-1 text-[12px] text-dm-text-secondary">
        <LuClock3 size={16} aria-hidden="true" />
        <time>{timeAgo}</time>
      </div>

      {/* Title */}
      <h3
        className={`line-clamp-2 text-[16px] font-medium text-dm-text-primary ${textWidth}`}
      >
        {title}
      </h3>

      {/* Excerpt */}
      <p className={`line-clamp-3 text-[14px] text-dm-text-muted ${textWidth}`}>
        {excerpt}
      </p>

      {/* View Count */}
      <div className="mt-2 flex items-center gap-x-1 text-[16px] text-dm-text-secondary">
        <MdOutlineRemoveRedEye size={24} aria-hidden="true" />
        <span aria-label={`${views.toLocaleString()} ${t("views")}`}>
          {views.toLocaleString()}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link prefetch={false} href={href} className={cardClassName}>
        {cardContent}
      </Link>
    );
  }

  return <article className={cardClassName}>{cardContent}</article>;
}
