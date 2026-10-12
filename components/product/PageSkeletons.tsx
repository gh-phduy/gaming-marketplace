import { Skeleton } from "@/components/ui/skeleton";
import { ProductGallerySkeleton } from "./ProductGallerySkeleton";
import { PurchaseCardSkeleton } from "./PurchaseCardSkeleton";
import {
  PRODUCT_OVERVIEW_CLASS,
  PRODUCT_DESCRIPTION_CLASS,
  SELLER_FILTER_CLASS,
  SELLER_OFFER_CLASS,
} from "./product-layout";

export function TitleSkeleton() {
  return (
    <Skeleton
      aria-hidden="true"
      className="h-[30px] w-72 max-w-[80%] sm:h-[35px] lg:h-10"
    />
  );
}

export function ProductSectionSkeleton() {
  return (
    <div className={PRODUCT_OVERVIEW_CLASS}>
      <ProductGallerySkeleton />
      <PurchaseCardSkeleton />
    </div>
  );
}

export function ProductDescriptionSkeleton() {
  return (
    <div
      className={PRODUCT_DESCRIPTION_CLASS}
      data-skeleton="description"
      aria-hidden="true"
    >
      <div className="flex h-10 flex-col justify-around sm:h-12 lg:h-6">
        <Skeleton className="h-3.5 w-full sm:w-[65%]" />
        <Skeleton className="h-3.5 w-2/3 lg:hidden" />
      </div>
      <div className="flex h-7 items-center">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function SellerListSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-y-2"
      data-skeleton="sellers"
      aria-hidden="true"
    >
      <div className={SELLER_FILTER_CLASS}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[54px] rounded-xl" />
        ))}
        <Skeleton className="h-[54px] w-[54px] rounded-xl" />
      </div>
      <div className={SELLER_OFFER_CLASS}>
        <div className="flex h-[45px] items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex h-5 items-center xl:border-l xl:border-white/10 xl:pl-4">
          <Skeleton className="h-4 w-28 max-w-full" />
        </div>
        <div className="flex h-5 items-center xl:border-l xl:border-white/10 xl:pl-4">
          <Skeleton className="h-4 w-28 max-w-full" />
        </div>
        <div className="flex h-6 items-center gap-2 xl:border-l xl:border-white/10 xl:pl-4">
          <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
          <Skeleton className="h-3.5 w-40 max-w-full" />
        </div>
        <div className="flex h-12 flex-col justify-center gap-2 xl:border-l xl:border-white/10 xl:pl-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <Skeleton className="h-[54px] flex-1 rounded-xl xl:w-[54px] xl:flex-none" />
        </div>
      </div>
    </div>
  );
}

export function ProductContentSkeleton() {
  return (
    <div
      className="mb-6 flex w-full flex-col gap-y-4 sm:mb-8 sm:gap-y-6"
      aria-hidden="true"
    >
      <Skeleton className="h-7 w-52 md:h-8" />
      <div className="flex flex-col gap-y-3 rounded-lg bg-midnight-750 p-3 sm:gap-y-4 sm:p-5">
        <div className="flex h-5 items-center sm:h-6">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex h-10 flex-col justify-around sm:h-12 lg:h-6">
          <Skeleton className="h-3.5 w-full sm:w-[65%]" />
          <Skeleton className="h-3.5 w-2/3 lg:hidden" />
        </div>
      </div>
    </div>
  );
}
