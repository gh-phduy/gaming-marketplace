"use client";

import { useGamePreview } from "@/hooks/useGamePreview";
import GamePreviewVideo from "@/components/shared/GamePreviewVideo";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import PlatformBadges from "@/components/shared/PlatformBadges";
import { useTranslations } from "next-intl";
import GameCardCartOverlay from "@/components/shared/GameCardCartOverlay";

/* ============================================
   TYPES
   ============================================ */

interface UpcomingGameItemProps {
  id?: string;
  /** Game title */
  title?: string;
  /** Game price */
  price?: string;
  /** Release date */
  releaseDate?: string;
  /** Cover image path */
  coverImage?: string;
  /** Preview video path */
  previewVideo?: string;
  /** Platform icon */
  platform?: string;
  onAddToCart?: () => void;
}

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULTS = {
  title: "Deliver At All Costs",
  price: "$38.30",
  coverImage: "/product2.jpg",
  platform: "pc" as const,
} as const;

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * UpcomingGameItem Component
 *
 * Game card for upcoming releases with release date badge
 */
export default function UpcomingGameItem({
  id = "1",
  title = DEFAULTS.title,
  price = DEFAULTS.price,
  releaseDate,
  coverImage = DEFAULTS.coverImage,
  previewVideo,
  platform = DEFAULTS.platform,
  onAddToCart,
}: UpcomingGameItemProps) {
  const t = useTranslations("home");
  const productT = useTranslations("product");
  const preview = useGamePreview(previewVideo);

  return (
    <article
      ref={preview.containerRef}
      {...preview.interactionProps}
      className="relative mx-auto h-[300px] w-[252px] select-none 800:w-full"
      role="listitem"
    >
      <div
        className={
          "group absolute top-1/2 left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col overflow-hidden rounded-lg bg-surface-base " +
          preview.panelClass
        }
      >
        <Link
          prefetch={false}
          href={`/buy-cheap?id=${id}`}
          className="flex h-full w-full flex-col focus-visible:outline-2 focus-visible:outline-green-400"
        >
          {/* Media Container */}
          <div className="relative flex-1">
            {/* Release Date Badge */}
            {releaseDate && (
              <div
                className="pointer-events-none absolute top-0 left-0 z-20 flex h-[30px] items-center rounded-br-sm bg-[#8a783c]/80 px-2.5 text-[12px] whitespace-nowrap text-[#fff1c2]"
                aria-label={`${t("releaseDateLabel")} ${releaseDate}`}
              >
                <span>
                  {t("releaseLabel")}&nbsp;
                  <strong className="font-bold">{releaseDate}</strong>
                </span>
              </div>
            )}

            {/* Cover Image */}
            <div className="absolute inset-0 h-full w-full">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 800px) 252px, (min-width: 1920px) 25vw, 33vw"
              />
            </div>

            {/* Preview Video */}
            <GamePreviewVideo preview={preview} />

            {/* Price Overlay */}
            <div className="absolute bottom-0 w-full">
              <div className="relative flex h-[40px] w-full items-center justify-between gap-x-2 bg-surface-card/30 px-4 text-dm-text-primary backdrop-blur-xs 800:h-[65px]">
                <PlatformBadges platform={platform} size={18} />
                <span className="shrink-0 text-[15px] font-semibold whitespace-nowrap 800:text-xl">{price}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={
              "flex h-[57px] w-full shrink-0 items-center justify-between pl-2 " +
              (preview.enabled ? "pr-2 " : "pr-14 ") +
              preview.footerClass
            }
          >
            <h3 className="min-w-0 truncate text-[14px] font-medium text-dm-text-primary 800:text-xl 800:font-semibold">
              {title}
            </h3>
          </div>
        </Link>
        <GameCardCartOverlay
          title={title}
          label={productT("addToCart")}
          enabled={preview.enabled}
          active={preview.active}
          onAddToCart={onAddToCart}
        />
      </div>
    </article>
  );
}
