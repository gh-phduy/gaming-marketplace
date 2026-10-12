"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { HERO_SLIDES, HERO_SLIDES_TOPUP } from "@/lib/constants/hero";
import type { HeroSlidesProps } from "./types";
import { useHeroCarouselSelection } from "./hooks";

/**
 * Main hero slideshow. Keeps embla config local while receiving active tab
 * and pagination state from parent container.
 */
export function HeroSlides({ activeTab }: HeroSlidesProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const { current, scrollTo } = useHeroCarouselSelection(api);
  const slides = activeTab === "digital" ? HERO_SLIDES : HERO_SLIDES_TOPUP;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 699px)");

    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    const autoScrollInterval = window.setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => {
      window.clearInterval(autoScrollInterval);
    };
  }, [api]);

  return (
    // overflow-hidden + rounded-3xl clips ALL slides during Embla's
    // CSS-transform-based transition — the only reliable fix for square corners.
    <div className="group relative aspect-square h-auto w-full cursor-pointer overflow-hidden rounded-3xl min-[700px]:aspect-auto min-[700px]:h-full min-[700px]:max-h-none min-[700px]:max-w-none">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="h-full w-full"
      >
        <CarouselContent className="h-full">
          {slides.map((slide, index) => {
            const imageSrc = isMobileViewport
              ? slide.image
                  .replace(
                    /\/hero-slide-(\d+)\.webp$/,
                    "/hero-slide-mobile-$1.webp",
                  )
                  .replace(
                    /\/hero-slide-tab-(\d+)\.webp$/,
                    "/hero-slide-tab-mobile-$1.webp",
                  )
              : slide.image;

            const slideContent = (
              <div className="relative h-full w-full">
                <Image
                  src={imageSrc}
                  alt={slide.alt || slide.id}
                  fill
                  sizes="(max-width: 699px) 100vw, (max-width: 1199px) 96vw, (min-width: 1920px) 1050px, (min-width: 1640px) 863px, (min-width: 1200px) 760px, 100vw"
                  className="pointer-events-none object-cover"
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            );

            return (
              <CarouselItem key={slide.id} className="h-full">
                {slide.link ? (
                  <Link href={slide.link} className="block h-full w-full" aria-label={`View ${slide.alt || slide.id}`}>
                    {slideContent}
                  </Link>
                ) : (
                  slideContent
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="pointer-events-none left-3 h-9 w-9 cursor-pointer border-none bg-black/40 text-white opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-black/60 active:scale-95 min-[500px]:left-6 min-[500px]:h-12 min-[500px]:w-12" />
        <CarouselNext className="pointer-events-none right-3 h-9 w-9 cursor-pointer border-none bg-black/40 text-white opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-black/60 active:scale-95 min-[500px]:right-6 min-[500px]:h-12 min-[500px]:w-12" />
        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1.5 backdrop-blur-md min-[500px]:gap-2 min-[500px]:px-3 min-[500px]:py-2 min-[700px]:bottom-5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-1 rounded-full transition-all duration-300 min-[500px]:h-1.5",
                current === index
                  ? "w-5 bg-forest-500"
                  : "w-1.5 bg-white/30 hover:bg-white/60 min-[500px]:w-2",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
