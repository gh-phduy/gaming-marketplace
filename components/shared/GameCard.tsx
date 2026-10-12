/**
 * GameItem Component
 *
 * Interactive game card with video preview on hover
 * Uses GSAP for smooth animations
 */

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { BsPersonFillCheck, BsBasket3Fill } from "react-icons/bs";
import PlatformBadges from "./PlatformBadges";

/* ============================================
   TYPES
   ============================================ */

interface GameItemProps {
  id?: string;
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
  platform?: string;
}

/* ============================================
   CONSTANTS
   ============================================ */

/** Default values for the component */
const DEFAULTS = {
  title: "Deliver At All Costs",
  price: "$38.30",
  coverImage: "/product1.png",
  previewVideo: "/video/product1.webm",
  sellerName: "Easy-key",
  sellerAvatar: "/avt1.png",
  sellerRank: "🦄 Legendary",
} as const;

/** Animation durations */
const ANIMATION = {
  containerExpand: 0.7,
  imageFade: 0.3,
  videoFade: 0.3,
  cartSlide: 1,
  footerColor: 0.5,
} as const;

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * GameItem Component
 *
 * Game card with hover video preview, add to cart animation, and GSAP effects
 */
export default function GameItem({
  id = "1",
  title = DEFAULTS.title,
  price = DEFAULTS.price,
  coverImage = DEFAULTS.coverImage,
  previewVideo = DEFAULTS.previewVideo,
  sellerName = DEFAULTS.sellerName,
  sellerAvatar = DEFAULTS.sellerAvatar,
  sellerRank = DEFAULTS.sellerRank,
  onAddToCart,
  platform,
}: GameItemProps) {
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
  const cardHoverRef = useRef<HTMLDivElement>(null);
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
      // Slide in cart button
      .to(
        cardHoverRef.current,
        {
          x: 0,
          duration: ANIMATION.cartSlide,
          ease: "power2.out",
        },
        0.2,
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

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.();
    },
    [onAddToCart],
  );

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
            {platform && (
              <PlatformBadges
                platform={platform}
                className="absolute top-0 left-0 z-10 rounded-br-lg bg-black/55 px-2 py-1.5 text-white backdrop-blur-sm"
              />
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
                    Rank: {sellerRank}
                  </span>
                </div>

                {/* Add to Cart Button (slides in on hover) */}
                <div
                  ref={cardHoverRef}
                  className="absolute inset-0 w-[225px]"
                  style={{ transform: "translateX(-100%)" }}
                >
                  <button
                    onClick={handleAddToCart}
                    className="relative h-full w-full bg-dm-accent-green pr-8 transition-colors hover:bg-dm-accent-green-hover"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 30px) 0, 100% 50%, calc(100% - 30px) 100%, 0 100%)",
                    }}
                    aria-label={`Add ${title} to cart`}
                  >
                    <div className="absolute inset-0 flex h-full w-full items-center gap-x-3 px-5 pr-12 text-[14px] font-bold text-dm-text-primary">
                      <BsBasket3Fill aria-hidden="true" />
                      <span>ADD TO CART</span>
                    </div>
                  </button>
                </div>
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
            <span className="text-xl font-semibold text-dm-text-primary">
              {price}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
