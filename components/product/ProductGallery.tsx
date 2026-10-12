import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PlatformBadges from "@/components/shared/PlatformBadges";
import { getProductDetailImage } from "@/lib/product-detail-image";
import { PRODUCT_GALLERY_CLASS } from "./product-layout";

interface ProductGalleryProps {
  images?: string[];
  name?: string;
  platform?: string;
}

export default function ProductGallery({
  images = ["/battlefield_6.jpg"],
  name = "Product Image",
  platform = "Xbox Series X/S",
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const originalImage = images[activeIndex] ?? "/battlefield_6.jpg";
  const detailImage = failedImages.includes(originalImage)
    ? originalImage
    : getProductDetailImage(originalImage);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={PRODUCT_GALLERY_CLASS}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={detailImage}
          onError={() => {
            if (detailImage !== originalImage)
              setFailedImages((current) => [...current, originalImage]);
          }}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 780px"
        />
        {/* Gradient overlay for better text/UI visibility */}
      </div>

      {/* Navigation arrows (only if multiple images) */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous product image"
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next product image"
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots indicator (only if multiple images) */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                idx === activeIndex ? "w-4 bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="absolute right-0 bottom-0 left-0 flex h-11 items-center justify-center gap-2 bg-[#1d2430]/75 px-3 backdrop-blur-sm sm:h-[50px] sm:gap-3 sm:px-6">
        <PlatformBadges
          platform={platform}
          showLabel
          compactLabels
          size={16}
          className="justify-center gap-1.5 text-white sm:gap-3"
          badgeClassName="rounded-full bg-white/10 px-2 py-1.5 sm:px-3"
        />
      </div>
    </div>
  );
}
