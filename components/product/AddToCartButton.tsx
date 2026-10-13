/**
 * AddToCartCard Component
 *
 * Product card with add to cart functionality
 * Features video preview on hover
 */

"use client";

import { useCallback } from "react";
import { useGamePreview } from "@/hooks/useGamePreview";
import GamePreviewVideo from "@/components/shared/GamePreviewVideo";
import Image from "next/image";
import { BsPersonFillCheck } from "react-icons/bs";
import { useTranslations } from "next-intl";
import GameCardCartButton from "@/components/shared/GameCardCartButton";

/* ============================================
   TYPES
   ============================================ */

interface AddToCartCardProps {
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
}

/* ============================================
   CONSTANTS
   ============================================ */

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
 * AddToCartCard Component
 */
export default function AddToCartCard({
  title = DEFAULTS.title,
  price = DEFAULTS.price,
  coverImage = DEFAULTS.coverImage,
  previewVideo,
  sellerName = DEFAULTS.sellerName,
  sellerAvatar = DEFAULTS.sellerAvatar,
  sellerRank = DEFAULTS.sellerRank,
  onAddToCart,
}: AddToCartCardProps) {
  const t = useTranslations("product");
  const preview = useGamePreview(previewVideo);

  const handleAddToCart = useCallback(() => {
    onAddToCart?.();
  }, [onAddToCart]);

  return (
    <article
      ref={preview.containerRef}
      {...preview.interactionProps}
      className="relative h-[300px] w-[360px]"
    >
      <div
        className={
          "group absolute top-1/2 left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col overflow-hidden rounded-lg bg-surface-base " +
          preview.panelClass
        }
        tabIndex={0}
        aria-label={`${title} - ${price}`}
      >
        {/* Media Container */}
        <div className="relative flex-1">
          {/* Cover Image */}
          <div className="absolute inset-0 h-full w-full">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
              sizes="360px"
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
                  {t("rank")}: {sellerRank}
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
                  label={t("addToCart")}
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
            "flex h-[57px] w-full items-center justify-between px-2 " +
            preview.footerClass
          }
        >
          <h3 className="truncate text-xl font-semibold text-dm-text-primary">
            {title}
          </h3>
          <span className="text-xl font-semibold text-dm-text-primary">
            {price}
          </span>
        </div>
      </div>
    </article>
  );
}
