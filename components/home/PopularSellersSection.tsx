"use client";

import { Link } from "@/i18n/routing";
import { useCallback, useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getSellerProfilePath } from "../user/seller-profile.route";
import SectionHeader from "../shared/SectionHeader";
import { ImStarFull } from "react-icons/im";
import { IoIosArrowForward } from "react-icons/io";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useTranslations } from "next-intl";

import type { PopularSeller } from "@/lib/popular-sellers";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

interface SellerItemProps {
  id: string;
  productCount: number;
  avatar: string;
  name: string;
  rating: string;
  verified?: boolean;
  profileName?: string;
}

/* ==========================================================================
   SUBCOMPONENT: SellerItem Card
   ========================================================================== */

/**
 * SellerItem Component
 * Renders a seller card previewing their name, avatar, rating stars,
 * and current performance tier badge. Links to the seller profile page.
 */
function SellerItem({
  id,
  productCount,
  avatar,
  name,
  rating,
  verified = false,
  profileName = name,
}: SellerItemProps) {
  const t = useTranslations("home");

  return (
    <Link
      prefetch={false}
      href={getSellerProfilePath(id)}
      className="block w-[252px] cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:brightness-125"
    >
      {/* Seller Identity & Rating Header */}
      <div className="flex h-[90px] w-full items-center bg-[#212937] px-4">
        <div className="relative h-[50px] w-[50px] shrink-0">
          <Image
            className="rounded-full object-cover"
            src={avatar}
            alt={`${profileName} profile picture`}
            fill
            sizes="50px"
          />
          {verified ? (
            <span
              className="absolute -right-1 -bottom-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#212937] bg-green-500"
              aria-label={t("verifiedSeller")}
            >
              <svg
                className="h-2.5 w-2.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          ) : null}
        </div>

        <div className="min-w-0 pl-3">
          <span className="block truncate text-[16px] font-medium text-white">
            {name}
          </span>
          <div
            className="flex items-center gap-x-2"
            role="group"
            aria-label={`${t("rating")}: ${rating} ${t("outOf5Stars")}`}
          >
            <span className="text-[14px] text-[#a0a4ac]">{rating}/5</span>
            {Array.from({ length: 5 }, (_, index) => (
              <ImStarFull
                key={index}
                className={`text-xs ${index < Math.round(Number(rating)) ? "text-yellow-300" : "text-slate-600"}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Seller Badge & Action Footer */}
      <div className="flex h-[44px] w-full items-center justify-between bg-[#2b3545] px-4">
        <div className="flex items-center gap-2 text-[14px] text-white">
          <Trophy className="h-4 w-4 text-cyan-300" aria-hidden="true" />
          {productCount} {t("products")}
        </div>
        <span className="flex items-center gap-x-2 text-[#C0C3C9] transition-colors hover:text-white">
          <span className="text-[16px]">{t("view")}</span>
          <IoIosArrowForward size={20} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

/* ==========================================================================
   MAIN COMPONENT: PopularSellers Carousel Section
   ========================================================================== */

export default function PopularSellers({
  sellers,
}: {
  sellers: PopularSeller[];
}) {
  const t = useTranslations("home");
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Callback handlers for manually driving carousel movements
  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  // Synchronize Embla scrolling boundaries with arrow button disable states
  useEffect(() => {
    if (!api) {
      return;
    }

    const updateSelection = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateSelection();
    api.on("select", updateSelection);
    api.on("reInit", updateSelection);

    return () => {
      api.off("select", updateSelection);
      api.off("reInit", updateSelection);
    };
  }, [api]);

  return (
    <section
      className="w-full max-w-[720px] rounded-lg px-8 800:px-0 990:max-w-[940px] 1200:max-w-[1140px] 1640:max-w-[1310px] 1920:max-w-[1590px]"
      aria-labelledby="popular-sellers-heading"
    >
      {/* Section Heading & Link to Trusted Sellers directory */}
      <SectionHeader
        headingId="popular-sellers-heading"
        headingText={t("popularSellers")}
        title={t("popularSellersTitle")}
        titleClassName="-translate-x-[22px]"
        viewAllHref="/user/trusted-sellers"
        viewAllAriaLabel={t("viewAllPopularSellers")}
      />

      {sellers.length === 0 && (
        <p className="py-6 text-sm text-slate-400">No sellers available.</p>
      )}
      <div className="relative">
        <Carousel
          deferUntilVisible
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          {/* 
            Masked boundary: Applies a soft horizontal fade gradient on left and right edges
            to indicate that the slider is scrollable beyond the screen edge.
          */}
          <div
            className="carousel-content-wrapper"
            style={{
              maskImage: `linear-gradient(
                to right,
                transparent 0%,
                black 12%,
                black 88%,
                transparent 100%
              )`,
              WebkitMaskImage: `linear-gradient(
                to right,
                transparent 0%,
                black 8%,
                black 92%,
                transparent 100%
              )`,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {sellers.map((seller) => (
                <CarouselItem
                  key={seller.id}
                  className="basis-auto pl-2 md:pl-4"
                >
                  <SellerItem
                    id={seller.id}
                    productCount={seller.productCount}
                    avatar={seller.avatar_url || "/avt-placeholder.jpg"}
                    name={seller.display_name}
                    rating={seller.rating.toFixed(2)}
                    verified={seller.is_verified_seller}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>

        {/* Prev / Next Custom Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-1/2 -left-16 z-20 hidden h-10 w-10 -translate-y-1/2 items-center rounded-full border-slate-600 bg-slate-700/90 text-white shadow-lg backdrop-blur-xs transition-all duration-200 hover:scale-110 hover:bg-slate-600 800:flex ${
            !canScrollPrev ? "cursor-not-allowed opacity-50" : ""
          }`}
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label={t("previousSellers")}
        >
          <MdArrowBackIos
            className="h-4 w-4 translate-x-1"
            aria-hidden="true"
          />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`absolute top-1/2 -right-16 z-20 hidden h-10 w-10 -translate-y-1/2 items-center rounded-full border-slate-600 bg-slate-700/90 text-white shadow-lg backdrop-blur-xs transition-all duration-200 hover:scale-110 hover:bg-slate-600 800:flex ${
            !canScrollNext ? "cursor-not-allowed opacity-50" : ""
          }`}
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label={t("nextSellers")}
        >
          <MdArrowForwardIos className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
