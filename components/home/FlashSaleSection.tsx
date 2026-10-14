/**
 * SaleTime Component
 *
 * Countdown timer section with diagonal game images
/**
 * SaleTime Component
 *
 * Countdown timer section with diagonal game images
 * Displays flash sale with time remaining
 */

"use client";

import bgTimeSaleImage from "@/public/bg-time-sale.webp";
import flashSale261Weekly1Image from "@/public/flash-sale/261_weekly_1.webp";
import flashSale260Weekly1Image from "@/public/flash-sale/260_weekly_1.webp";
import flashSale262Weekly1Image from "@/public/flash-sale/262_weekly_1.webp";
import flashSale263Weekly1Image from "@/public/flash-sale/263_weekly_1.webp";
import Image from "next/image";
import { useTranslations } from "next-intl";
import CountdownTimer from "../shared/CountdownTimer";

/* ============================================
   CONSTANTS
   ============================================ */

/** Clip path styles for diagonal images */
const CLIP_PATHS = {
  leftImage: "polygon(0 0, 50% 0, 100% 100%, 50% 100%)",
  rightImage: "polygon(50% 0, 100% 0, 50% 100%, 0% 100%)",
} as const;

/* ============================================
   SUB-COMPONENTS
   ============================================ */

interface DiagonalImageProps {
  src: string;
  alt: string;
  position: "left-near" | "left-far" | "right-near" | "right-far";
  hasHoverEffect?: boolean;
}

/**
 * Diagonal image with clip-path and hover effect
 */
function DiagonalImage({
  src,
  alt,
  position,
  hasHoverEffect = false,
}: DiagonalImageProps) {
  const isLeft = position.startsWith("left");
  const isFar = position.endsWith("far");

  // Position classes based on position prop
  const positionClasses = {
    "left-near": "left-0 translate-x-[4%]",
    "left-far": "left-0 -translate-x-1/2",
    "right-near": "right-0 -translate-x-[4%]",
    "right-far": "right-0 translate-x-1/2",
  };

  const clipPath = isLeft ? CLIP_PATHS.leftImage : CLIP_PATHS.rightImage;

  return (
    <div
      className={`absolute top-0 bottom-0 hidden h-full w-[clamp(250px,31vw,520px)] 800:block ${isFar ? "z-0" : "z-10"} ${positionClasses[position]}`}
    >
      <div
        className="relative h-full w-full"
        style={{ clipPath }}
      >
        {/* Game Image */}
        <div
          className={`relative w-full h-full ${hasHoverEffect
            ? "hover:scale-110 ease-linear transition-transform duration-1000"
            : ""
            }`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 800px) 0px, (max-width: 1677px) 31vw, 520px"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * SaleTime Component
 *
 * Flash sale countdown section with diagonal game images
 */
export default function FlashSaleSection() {
  const t = useTranslations("home");
  return (
    <section
      className="w-full overflow-hidden px-0"
      aria-label={t("flashSaleCountdown")}
    >
      <div className="h-[222px] 1000:h-[280px] 1300:h-[380px] 1440:h-[455px] w-full flex items-center justify-center relative bg-surface-base overflow-hidden">
        {/* Background */}
        <Image
          src={bgTimeSaleImage.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover z-0"
          aria-hidden="true"
          priority={false}
        />

        {/* Left Images */}
        <DiagonalImage
          src={flashSale261Weekly1Image.src}
          alt="Palworld"
          position="left-near"
          hasHoverEffect
        />
        <DiagonalImage
          src={flashSale260Weekly1Image.src}
          alt="Baldur's Gate 3"
          position="left-far"
        />

        {/* Countdown Timer */}
        <div className="text-dm-text-primary h-full flex items-center z-20">
          <CountdownTimer />
        </div>

        {/* Right Images */}
        <DiagonalImage
          src={flashSale262Weekly1Image.src}
          alt="Cyberpunk 2077"
          position="right-near"
          hasHoverEffect
        />
        <DiagonalImage
          src={flashSale263Weekly1Image.src}
          alt="Resident Evil 4"
          position="right-far"
        />
      </div>
    </section>
  );
}
