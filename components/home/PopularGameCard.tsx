"use client";

import { useGamePreview } from "@/hooks/useGamePreview";
import GamePreviewVideo from "@/components/shared/GamePreviewVideo";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import PlatformBadges from "@/components/shared/PlatformBadges";
import GameCardCartOverlay from "@/components/shared/GameCardCartOverlay";
import { useTranslations } from "next-intl";

interface PopularGameItemProps {
  id?: string | number;
  title?: string;
  price?: string;
  coverImage?: string;
  previewVideo?: string;
  platform?: string;
  onAddToCart?: () => void;
}

export default function PopularGameItem({
  id = "1",
  title = "Deliver At All Costs",
  price = "$38.30",
  coverImage = "/product1.png",
  previewVideo,
  platform = "pc",
  onAddToCart,
}: PopularGameItemProps) {
  const preview = useGamePreview(previewVideo);
  const t = useTranslations("product");

  return (
    <article
      ref={preview.containerRef}
      {...preview.interactionProps}
      className="game-card relative mx-auto h-[300px] w-[252px] select-none 800:w-full"
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
          href={"/buy-cheap?id=" + id}
          className="flex h-full w-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-400"
        >
          <div className="relative flex-1">
            <div className="absolute inset-0 h-full w-full">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 800px) 252px, (min-width: 1920px) 25vw, 33vw"
              />
            </div>
            <GamePreviewVideo preview={preview} />
            <div className="absolute bottom-0 w-full">
              <div className="relative flex h-[40px] w-full items-center justify-between gap-x-2 bg-black/40 px-4 backdrop-blur-md 800:h-[65px]">
                <PlatformBadges
                  platform={platform}
                  size={14}
                  className="text-white"
                />
                <span className="text-[15px] font-semibold text-white">
                  {price}
                </span>
              </div>
            </div>
          </div>
          <div
            className={
              "flex h-[57px] w-full shrink-0 items-center pl-4 " +
              (preview.enabled ? "pr-4 " : "pr-14 ") +
              preview.footerClass
            }
          >
            <h3 className="truncate text-[14px] font-medium text-white">
              {title}
            </h3>
          </div>
        </Link>
        <GameCardCartOverlay
          title={title}
          label={t("addToCart")}
          enabled={preview.enabled}
          active={preview.active}
          onAddToCart={onAddToCart}
        />
      </div>
    </article>
  );
}
