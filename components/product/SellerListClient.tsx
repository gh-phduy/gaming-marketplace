"use client";

import { useState } from "react";
import SellerFilterBar, {
  DEFAULT_OFFER_FILTERS,
  OfferFilters,
} from "./SellerFilterBar";
import SellerRow, { SellerOffer } from "./SellerRow";
import { TbReload } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { matchesPlatformFilter } from "@/lib/platforms";

/**
 * Props for the SellerListClient component.
 */
interface SellerListClientProps {
  /** The initial array of seller offers retrieved from the server */
  initialOffers: SellerOffer[];
}

/**
 * SellerListClient Component
 *
 * Renders a list of seller offers with a custom filter bar.
 * By default, limits the list to display the first 6 offers.
 * If there are more than 6 offers, displays a reload-styled "Show More"
 * toggle button to expand the list.
 */
export default function SellerListClient({
  initialOffers,
}: SellerListClientProps) {
  const t = useTranslations("product");
  // State to control list expansion
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState<OfferFilters>(DEFAULT_OFFER_FILTERS);
  const filteredOffers = initialOffers
    .filter(
      (offer) =>
        (filters.edition === "all" || offer.data.edition === filters.edition) &&
        (filters.platform === "all" ||
          matchesPlatformFilter(offer.data.platform, filters.platform)) &&
        (filters.region === "all" ||
          offer.data.activationRegion === filters.region),
    )
    .sort((a, b) =>
      filters.sort === "rating"
        ? b.seller.rating - a.seller.rating
        : filters.sort === "price_desc"
          ? b.data.price - a.data.price
          : a.data.price - b.data.price,
    );

  // Compute slice based on toggle state
  const visibleOffers = showAll ? filteredOffers : filteredOffers.slice(0, 6);
  const hasMore = filteredOffers.length > 6;

  return (
    <div className="flex w-full flex-col gap-y-2">
      {/* Search and sorting filters */}
      <SellerFilterBar
        offers={initialOffers}
        filters={filters}
        onChange={(field, value) => {
          setFilters((previous) => ({ ...previous, [field]: value }));
          setShowAll(false);
        }}
        onReset={() => {
          setFilters(DEFAULT_OFFER_FILTERS);
          setShowAll(false);
        }}
      />

      {/* Rendered offers list */}
      <div className="flex flex-col gap-y-2">
        {visibleOffers.map((offer: SellerOffer) => (
          <SellerRow key={offer.data.id} offer={offer} />
        ))}
      </div>

      {/* Empty state when no offers exist */}
      {filteredOffers.length === 0 && (
        <div className="rounded-lg bg-[#2a3441] p-4 text-center text-gray-400">
          {t("noSellers")}
        </div>
      )}

      {/* Expand/Collapse toggle button styled like original LoadMoreButton */}
      {hasMore && (
        <div
          onClick={() => setShowAll(!showAll)}
          className="mt-2 flex h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-midnight-750 text-sm font-semibold text-white uppercase transition-colors hover:bg-midnight-700/80"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setShowAll(!showAll);
            }
          }}
        >
          {/* Reload icon rotates 180 degrees when expanded */}
          <TbReload
            size={24}
            className={
              showAll
                ? "rotate-180 transition-transform duration-300"
                : "transition-transform duration-300"
            }
          />
          <span>
            {showAll
              ? t("showLess")
              : `${t("showMore")} (${filteredOffers.length - 6} ${t("more")})`}
          </span>
        </div>
      )}
    </div>
  );
}
