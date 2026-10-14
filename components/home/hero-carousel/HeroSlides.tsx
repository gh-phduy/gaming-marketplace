"use client";

import { useEffect, useState } from "react";
import { getImageProps } from "next/image";
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
  const [firstSlideLoaded, setFirstSlideLoaded] = useState(false);
  const { current, scrollTo } = useHeroCarouselSelection(api);
  const slides = activeTab === "digital" ? HERO_SLIDES : HERO_SLIDES_TOPUP;

  useEffect(() => {
    if (!api || !firstSlideLoaded) return;

    const autoScrollInterval = window.setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => {
      window.clearInterval(autoScrollInterval);
    };
  }, [api, firstSlideLoaded]);

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
            const common = {
              alt: slide.alt || slide.id,
              fill: true,
              className: "pointer-events-none object-cover",
              fetchPriority:
                index === 0 ? ("high" as const) : ("auto" as const),
              loading: index === 0 ? ("eager" as const) : ("lazy" as const),
            };
            const { props: desktop } = getImageProps({
              ...common,
              src: slide.image,
              sizes:
                "(min-width: 1920px) 1050px, (min-width: 1640px) 863px, (min-width: 1200px) 760px, (min-width: 1100px) 610px, 96vw",
            });
            const { props: mobile } = getImageProps({
              ...common,
              src: slide.mobileImage,
              sizes: "calc(100vw - 48px)",
            });

            const slideContent = (
              <div className="relative h-full w-full">
                {/* Hidden slides start loading after the first banner arrives. */}
                {(index === 0 || index === current || firstSlideLoaded) && (
                  <picture>
                    <source
                      media="(max-width: 699px)"
                      srcSet={mobile.srcSet}
                      sizes={mobile.sizes}
                    />
                    {/* The browser chooses the right art direction before hydration. */}
                    {}
                    <img
                      {...desktop}
                      alt={common.alt}
                      ref={(image) => {
                        // A cached image may finish before hydration attaches
                        // the load handler. Release the other slides in that case.
                        if (
                          index === 0 &&
                          image?.complete &&
                          image.naturalWidth > 0
                        )
                          setFirstSlideLoaded(true);
                      }}
                      onLoad={
                        index === 0
                          ? () => setFirstSlideLoaded(true)
                          : undefined
                      }
                    />
                  </picture>
                )}
              </div>
            );

            return (
              <CarouselItem key={slide.id} className="h-full">
                {slide.link ? (
                  <Link
                    prefetch={false}
                    href={slide.link}
                    className="block h-full w-full"
                    aria-label={`View ${slide.alt || slide.id}`}
                  >
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
              className="flex h-6 min-w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={current === index ? "true" : undefined}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-1 rounded-full transition-all duration-300 min-[500px]:h-1.5",
                  current === index
                    ? "w-5 bg-forest-500"
                    : "w-1.5 bg-white/30 hover:bg-white/60 min-[500px]:w-2",
                )}
              />
            </button>
          ))}
        </div>
      </Carousel>
    </div>
  );
}
