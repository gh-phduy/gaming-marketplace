import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_GALLERY_CLASS } from "./product-layout";

/**
 * Detailed Skeleton for ProductGallery component
 * Matches the main image and platform bar of ProductGallery.
 */
export function ProductGallerySkeleton() {
  return (
    <div
      className={PRODUCT_GALLERY_CLASS}
      data-skeleton="gallery"
      aria-hidden="true"
    >
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-x-0 bottom-0 flex h-11 items-center justify-center bg-[#1d2430]/75 sm:h-[50px]">
        <Skeleton className="h-9 w-40 rounded-full" />
      </div>
    </div>
  );
}
