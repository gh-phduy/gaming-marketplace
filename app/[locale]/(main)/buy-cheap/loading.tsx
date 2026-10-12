/**
 * Loading UI for Buy Cheap Page
 *
 * Automatically used by Next.js while the page is loading.
 */

import { Skeleton } from "@/components/ui/skeleton";
import {
  TitleSkeleton,
  ProductSectionSkeleton,
  ProductDescriptionSkeleton,
  SellerListSkeleton,
  ProductContentSkeleton,
} from "@/components/product/PageSkeletons";
import { PRODUCT_PAGE_CLASS } from "@/components/product/product-layout";

export default function Loading() {
  return (
    <main id="main-content" aria-busy="true" className={PRODUCT_PAGE_CLASS}>
      <span role="status" className="sr-only">
        Loading product…
      </span>
      {/* Breadcrumbs Skeleton */}
      <div
        aria-hidden="true"
        className="flex h-6 w-full items-center gap-2 overflow-hidden pb-1"
      >
        <Skeleton className="h-5 w-5 shrink-0" />
        <Skeleton className="h-3 w-3 shrink-0" />
        <Skeleton className="h-3.5 w-20 shrink-0" />
        <Skeleton className="h-3 w-3 shrink-0" />
        <Skeleton className="h-3.5 w-24 shrink-0" />
        <Skeleton className="h-3 w-3 shrink-0" />
        <Skeleton className="h-3.5 w-24 shrink-0" />
      </div>

      {/* Title Skeleton */}
      <TitleSkeleton />

      {/* Main Content: Gallery + PurchaseCard */}
      <ProductSectionSkeleton />

      {/* Description Section Skeleton */}
      <ProductDescriptionSkeleton />

      {/* Seller List Skeleton */}
      <SellerListSkeleton />
      <ProductContentSkeleton />
    </main>
  );
}
