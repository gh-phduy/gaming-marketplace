/**
 * PopularGameItem Component
 *
 * Interactive game card with video preview on hover
 * Uses GSAP for smooth animations
 */

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import PlatformBadges from "@/components/shared/PlatformBadges";

/* ============================================
   TYPES
   ============================================ */

interface PopularGameItemProps {
  /** Game ID */
  id?: string | number;
  /** Game title */
  title?: string;
  /** Game price */
  price?: string;
  /** Cover image path */
  coverImage?: string;
  /** Preview video path */
  previewVideo?: string;
  /** Platform */
  platform?: string;
}

/* ============================================
   CONSTANTS
   ============================================ */

/** Default values for the component */
const DEFAULTS = {
  id: "1",
  title: "Deliver At All Costs",
  price: "$38.30",
  coverImage: "/product1.png",
  previewVideo: "/video/product1.webm",
  platform: "pc",
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
 * PopularGameItem Component
 *
 * Game card with hover video preview and GSAP animations
 */
export default function PopularGameItem({
  id = DEFAULTS.id,
  title = DEFAULTS.title,
  price = DEFAULTS.price,
  coverImage = DEFAULTS.coverImage,
  previewVideo = DEFAULTS.previewVideo,
  platform = DEFAULTS.platform,
}: PopularGameItemProps) {
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
      // Expand container
      .to(
        containerRef.current,
        {
          height: "300px",
          duration: ANIMATION.containerExpand,
          ease: "power2.out",
        },
        0,
      )
      // Fade out image
      .to(
        imageRef.current,
        {
          opacity: 0,
          duration: ANIMATION.imageFade,
          ease: "power2.out",
        },
        0,
      )
      // Fade in video
      .to(
        videoRef.current,
        {
          opacity: 1,
          duration: ANIMATION.videoFade,
          ease: "power2.out",
        },
        0.1,
      )
      // Change footer background
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
          aria-label={`${title} - ${price}`}
        >
          {/* Media Container */}
          <div className="relative flex-1">
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

            {/* Platform & Price Overlay */}
            <div className="absolute bottom-0 w-full">
              <div className="relative flex h-[40px] w-full items-center justify-between gap-x-2 bg-black/40 px-4 backdrop-blur-md">
                {/* Platform Icons */}
                <div className="flex items-center gap-x-2">
                  <PlatformBadges
                    platform={platform}
                    size={14}
                    className="text-white"
                  />
                </div>

                {/* Price */}
                <span className="text-[15px] font-semibold text-white">
                  {price}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            ref={footerRef}
            className="flex h-[57px] w-full items-center bg-surface-card px-4"
          >
            <h3 className="truncate text-[14px] font-medium text-white">
              {title}
            </h3>
          </div>
        </div>
      </Link>
    </article>
  );
}
