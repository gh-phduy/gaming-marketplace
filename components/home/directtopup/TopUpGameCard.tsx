"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { TopUpGame } from "@/lib/constants/products";
import { cn } from "@/lib/utils";
import { useGamePreviewEnabled } from "@/hooks/useGamePreview";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

interface TopUpGameCardProps {
  game: TopUpGame;
  className?: string;
}

/* ==========================================================================
   MAIN COMPONENT: TopUpGameCard
   ========================================================================== */

/**
 * TopUpGameCard Component
 *
 * Renders a square top-up item card featuring a dynamic thumbnail cover.
 * Shows the game's title on card hover, slide-animating from the bottom edge.
 * Implements fallback rendering if the remote cover image fails to load.
 */
export function TopUpGameCard({ game, className }: TopUpGameCardProps) {
  const [imgError, setImgError] = useState(false);
  const animated = useGamePreviewEnabled();

  // Normalizes routing pathways based on categorizations (e.g. services vs games)
  const categoryPath =
    game.category === "services" ? "services" : `${game.category}-games`;

  return (
    <div
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-[#1a1a1f] sm:rounded-2xl",
        "aspect-[4/5] w-full shrink-0 cursor-pointer shadow-lg sm:aspect-square",
        className,
      )}
    >
      <Link
        href={`/direct-top-up/${categoryPath}/${game.slug}`}
        className="block h-full w-full"
      >
        {/* Game Banner Image & Failure Fallback */}
        {!imgError ? (
          <div
            className={
              "absolute inset-0 " +
              (animated
                ? "transition-transform duration-500 ease-out group-hover:scale-110"
                : "transition-none")
            }
          >
            <Image
              src={game.coverImage}
              alt={game.name}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-900" />
        )}

        {/* Gradient Overlay for Text Visibility */}
        <div
          className={
            "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 " +
            (animated
              ? "transition-opacity duration-300 group-hover:opacity-100"
              : "transition-none")
          }
        />

        {/* Title Name Label (Always visible for mobile UX) */}
        <div className="absolute right-0 bottom-0 left-0 flex flex-col justify-end p-3 sm:p-5">
          <span className="line-clamp-2 text-center text-[13px] leading-tight font-bold text-white sm:text-lg">
            {game.name}
          </span>
        </div>
      </Link>
    </div>
  );
}
