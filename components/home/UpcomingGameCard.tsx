/**
 * UpcomingGameItem Component
 *
 * Game card with release date badge and video preview on hover
 * Uses GSAP for smooth animations
 */

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import PlatformBadges from "@/components/shared/PlatformBadges";
import { useTranslations } from "next-intl";

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
}

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULTS = {
  title: "Deliver At All Costs",
  price: "$38.30",
  coverImage: "/product2.jpg",
  previewVideo: "/video/product2.webm",
  platform: "pc" as const,
} as const;

/** Animation durations */
const ANIMATION = {
  containerExpand: 0.7,
  imageFade: 0.3,
  videoFade: 0.3,
  footerColor: 0.5,
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
  previewVideo = DEFAULTS.previewVideo,
  platform = DEFAULTS.platform,
}: UpcomingGameItemProps) {
  const t = useTranslations("home");
  // State
  const [isHovered, setIsHovered] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const isTouch = !window.matchMedia("(hover: hover) and (pointer: fine)")
        .matches;
      const isSmallScreen = window.innerWidth <= 800;
      setIsMobile(isTouch || isSmallScreen);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Refs
  const isHoveredRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Initialize GSAP timeline
  useEffect(() => {
    if (!containerRef.current || !imageRef.current || !footerRef.current) {
      return;
    }

    timelineRef.current = gsap.timeline({ paused: true });

    timelineRef.current
      .to(
        containerRef.current,
        {
          height: "300px",
          duration: ANIMATION.containerExpand,
          ease: "power2.out",
        },
        0,
      )
      .to(
        imageRef.current,
        {
          opacity: 0,
          duration: ANIMATION.imageFade,
          ease: "power2.out",
        },
        0,
      )
      .to(
        videoRef.current,
        {
          opacity: 1,
          duration: ANIMATION.videoFade,
          ease: "power2.out",
        },
        0.1,
      )
      .to(
        footerRef.current,
        {
          backgroundColor: "#2A3240",
          duration: ANIMATION.footerColor,
          ease: "power2.out",
        },
        0.3,
      );

    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  // Autoplay video when src is set and still hovered
  useEffect(() => {
    if (videoSrc && isHoveredRef.current && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    const hasMouse = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!hasMouse) return;

    isHoveredRef.current = true;

    if (!videoSrc) {
      setVideoSrc(previewVideo);
    } else if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      if (videoRef.current.readyState >= 3) {
        setIsHovered(true);
        timelineRef.current?.play();
      }
    }
  }, [videoSrc, previewVideo]);

  const handleCanPlay = useCallback(() => {
    if (isHoveredRef.current && videoRef.current) {
      setIsHovered(true);
      videoRef.current.play().catch(() => {});
      timelineRef.current?.play();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    timelineRef.current?.reverse();
  }, []);

  return (
    <article
      className="relative mx-auto h-[300px] w-[252px] select-none 800:w-full"
      role="listitem"
    >
      <Link href={`/buy-cheap?id=${id}`} className="block h-full w-full">
        <div
          ref={containerRef}
          className="group absolute top-1/2 left-1/2 flex h-[275px] w-full -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col overflow-hidden rounded-lg bg-surface-base"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          tabIndex={0}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
          aria-label={[
            title,
            releaseDate && `${t("releaseLabel")} ${releaseDate}`,
            price,
          ]
            .filter(Boolean)
            .join(" - ")}
        >
          {/* Media Container */}
          <div className="relative flex-1">
            {/* Release Date Badge */}
            {releaseDate && (
              <div
                className="pointer-events-none absolute z-20 flex items-center justify-center bg-[#95740080] px-2 py-[10px]"
                aria-label={`${t("releaseDateLabel")} ${releaseDate}`}
              >
                <span className="text-[12px] text-dm-accent-yellow">
                  {t("releaseLabel")} {releaseDate}
                </span>
              </div>
            )}

            {/* Cover Image */}
            <div ref={imageRef} className="absolute inset-0 h-full w-full">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 800px) 252px, 100%"
              />
            </div>

            {/* Preview Video */}
            {!isMobile && (
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover opacity-0"
                src={videoSrc}
                muted
                loop
                playsInline
                preload="none"
                onCanPlay={handleCanPlay}
                aria-hidden="true"
              />
            )}

            {/* Price Overlay */}
            <div className="absolute bottom-0 w-full">
              <div className="relative flex h-[65px] w-full items-center justify-between gap-x-2 bg-surface-card/30 px-4 text-dm-text-primary backdrop-blur-xs">
                <PlatformBadges platform={platform} size={18} />
                <span className="shrink-0 text-xl font-semibold">{price}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            ref={footerRef}
            className="flex h-[57px] w-full items-center justify-between bg-surface-card px-2"
          >
            <h3 className="truncate text-xl font-semibold text-dm-text-primary">
              {title}
            </h3>
          </div>
        </div>
      </Link>
    </article>
  );
}
