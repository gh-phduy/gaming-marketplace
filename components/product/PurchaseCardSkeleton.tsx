import { Skeleton } from "@/components/ui/skeleton";
import {
  PURCHASE_CARD_CLASS,
  PURCHASE_DETAILS_CLASS,
  PURCHASE_ACTIONS_CLASS,
} from "./product-layout";

export function PurchaseCardSkeleton() {
  return (
    <div
      className={PURCHASE_CARD_CLASS}
      data-skeleton="purchase"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="min-w-0">
            <div className="flex h-6 items-center">
              <Skeleton className="h-5 w-28 max-w-full" />
            </div>
            <div className="mt-1.5 flex h-4 items-center gap-3">
              <Skeleton className="h-3 w-9" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
          <Skeleton className="hidden h-10 w-10 rounded-full sm:block" />
          <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
        </div>
      </div>

      <div className={PURCHASE_DETAILS_CLASS}>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex h-5 min-w-0 items-center gap-2 xl:h-6"
          >
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-3.5 w-20 shrink-0" />
            <Skeleton className="h-4 w-24 max-w-full" />
          </div>
        ))}
      </div>

      <div className="mt-5 flex h-7 items-center gap-3">
        <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
        <Skeleton className="h-3.5 w-56 max-w-[70%]" />
        <Skeleton className="ml-auto h-5 w-5 shrink-0 rounded-full" />
      </div>
      <div className="mt-6 flex h-4 items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <Skeleton className="h-3 w-7" />
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 lg:mt-auto lg:pt-5">
        <div className="flex h-5 items-center">
          <Skeleton className="h-3.5 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-24 xl:h-8" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[60px] rounded-full" />
            <Skeleton className="h-8 w-[60px] rounded-full" />
          </div>
        </div>
      </div>
      <div className={PURCHASE_ACTIONS_CLASS}>
        <Skeleton className="h-[54px] rounded-xl" />
        <Skeleton className="h-[54px] rounded-xl" />
      </div>
    </div>
  );
}
