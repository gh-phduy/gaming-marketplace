"use client";

import { useCallback, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useNearViewport } from "@/hooks/useNearViewport";

/** One set of cards for both layouts; Embla is inactive on desktop. */
export default function ResponsiveGameList({
  children,
  label,
  layout = "grid",
}: {
  children: ReactNode[];
  label: string;
  layout?: "grid" | "columns";
}) {
  const { ref, ready } = useNearViewport();
  // Initialize near the viewport; desktop uses the same cards with Embla disabled.
  const [carouselRef, api] = useEmblaCarousel({
    active: ready,
    align: "center",
    loop: true,
    startIndex: Math.floor(children.length / 2),
    breakpoints: { "(min-width: 800px)": { active: false } },
  });
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      carouselRef?.(node);
    },
    [carouselRef, ref],
  );

  return (
    <div
      ref={attach}
      className="game-carousel-viewport mt-10 overflow-hidden 800:overflow-visible"
      onKeyDown={(event) => {
        if (window.matchMedia("(min-width: 800px)").matches) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          if (event.key === "ArrowLeft") api?.scrollPrev();
          else api?.scrollNext();
        }
      }}
    >
      <div
        role="list"
        aria-label={label}
        className={
          "game-list flex touch-pan-y gap-2 800:grid 800:grid-cols-3 800:gap-x-4 1920:grid-cols-4 [&>*]:shrink-0 " +
          (layout === "columns"
            ? "game-list-columns 800:grid-flow-col 800:grid-rows-2 800:gap-y-0"
            : "800:gap-y-4")
        }
      >
        {children}
      </div>
    </div>
  );
}
