"use client";

import { useCallback } from "react";
import { useGamePreview } from "@/hooks/useGamePreview";
import GamePreviewVideo from "@/components/shared/GamePreviewVideo";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { BsPersonFillCheck } from "react-icons/bs";
import PlatformBadges from "./PlatformBadges";
import GameCardCartButton from "./GameCardCartButton";

/* ============================================
   TYPES
   ============================================ */

interface GameItemProps {
  id?: string;
  /** Game title */
  title?: string;
  /** Game price */
  price?: string;
  /** Cover image path */
  coverImage?: string;
  /** Preview video path */
  previewVideo?: string;
  /** Seller name */
  sellerName?: string;
  /** Seller avatar */
  sellerAvatar?: string;
  /** Seller rank */
  sellerRank?: string;
  /** On add to cart callback */
  onAddToCart?: () => void;
  platform?: string;
}

/* ============================================
   CONSTANTS
   ============================================ */

/** Default values for the component */
const DEFAULTS = {
  title: "Deliver At All Costs",
  price: "$38.30",
  coverImage: "/product1.png",
  sellerName: "Easy-key",
  sellerAvatar: "/avt1.png",
  sellerRank: "🦄 Legendary",
} as const;

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * GameItem Component
 *
 * Game card with the shared desktop preview policy and a static mobile layout.
 */
export default function GameItem({
  id = "1",
  title = DEFAULTS.title,
  price = DEFAULTS.price,
  coverImage = DEFAULTS.coverImage,
  previewVideo,
  sellerName = DEFAULTS.sellerName,
  sellerAvatar = DEFAULTS.sellerAvatar,
  sellerRank = DEFAULTS.sellerRank,
  onAddToCart,
  platform,
}: GameItemProps) {
  const preview = useGamePreview(previewVideo);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.();
    },
    [onAddToCart],
  );

  return (
    <article
      ref={preview.containerRef}
      {...preview.interactionProps}
      className="relative mx-auto h-[300px] w-[252px] select-none 800:w-full"
      role="listitem"
    >
      <Link
        prefetch={false}
        href={`/buy-cheap?id=${id}`}
        className="block h-full w-full focus-visible:outline-2 focus-visible:outline-green-400"
      >
        <div
          className={
            "group absolute top-1/2 left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col overflow-hidden rounded-lg bg-surface-base " +
            preview.panelClass
          }
        >
          {/* Media Container */}
          <div className="relative flex-1">
            {platform && (
              <PlatformBadges
                platform={platform}
                className="absolute top-0 left-0 z-10 rounded-br-lg bg-black/55 px-2 py-1.5 text-white backdrop-blur-sm"
              />
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

            {/* Seller Info Overlay */}
            <div className="absolute bottom-0 w-full">
              <div className="relative flex h-[65px] w-full items-center gap-x-2 bg-surface-card/30 px-4 backdrop-blur-xs">
                {/* Seller Avatar */}
                <Image
                  src={sellerAvatar}
                  alt={`${sellerName} avatar`}
                  width={30}
                  height={30}
                  className="rounded-full"
                />

                {/* Seller Details */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-1 text-dm-text-primary">
                    <span className="text-[12px]">{sellerName}</span>
                    <BsPersonFillCheck size={15} aria-label="Verified seller" />
                  </div>
                  <span className="text-[10px] text-dm-text-muted">
                    Rank: {sellerRank}
                  </span>
                </div>

                {/* Add to Cart Button (slides in on hover) */}
                <div
                  className={
                    preview.enabled
                      ? "absolute inset-0 w-[200px] transition-transform duration-700 ease-in-out " +
                        (preview.active ? "translate-x-0" : "-translate-x-full")
                      : "absolute top-2.5 right-2 h-[45px] w-[45px] transition-none"
                  }
                >
                  <GameCardCartButton
                    title={title}
                    label="ADD TO CART"
                    expanded={preview.enabled}
                    onClick={handleAddToCart}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={
              "flex h-[57px] w-full items-center justify-between gap-2 px-2 " +
              preview.footerClass
            }
          >
            <h3 className="min-w-0 flex-1 truncate text-[14px] font-medium text-dm-text-primary 800:text-xl 800:font-semibold">
              {title}
            </h3>
            <span className="shrink-0 text-[15px] font-semibold whitespace-nowrap text-dm-text-primary 800:text-xl">
              {price}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
