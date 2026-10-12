"use client";

import { useTranslations } from "next-intl";
import {
  Award,
  Gamepad2,
  MapPin,
  ArrowDownWideNarrow,
  ChevronDown,
  X,
} from "lucide-react";
import type { SellerOffer } from "./SellerRow";
import { SELLER_FILTER_CLASS } from "./product-layout";
import { getProductPlatforms } from "@/lib/platforms";

export type OfferFilters = {
  edition: string;
  platform: string;
  region: string;
  sort: string;
};
export const DEFAULT_OFFER_FILTERS: OfferFilters = {
  edition: "all",
  platform: "all",
  region: "all",
  sort: "price_asc",
};

export default function SellerFilterBar({
  offers = [],
  filters = DEFAULT_OFFER_FILTERS,
  onChange,
  onReset,
}: {
  offers?: SellerOffer[];
  filters?: OfferFilters;
  onChange?: (field: keyof OfferFilters, value: string) => void;
  onReset?: () => void;
}) {
  const t = useTranslations("product");
  const unique = (field: "edition" | "platform" | "activationRegion") =>
    Array.from(
      new Set(
        offers.flatMap((offer) =>
          field === "platform"
            ? getProductPlatforms(offer.data.platform)
            : [offer.data[field]],
        ),
      ),
    )
      .sort()
      .map((value) => ({ value, label: value }));
  const fields = [
    {
      name: "edition" as const,
      icon: Award,
      label: t("allEditions"),
      options: [
        { value: "all", label: t("allEditions") },
        ...unique("edition"),
      ],
    },
    {
      name: "platform" as const,
      icon: Gamepad2,
      label: t("allPlatforms"),
      options: [
        { value: "all", label: t("allPlatforms") },
        ...unique("platform"),
      ],
    },
    {
      name: "region" as const,
      icon: MapPin,
      label: t("allRegions"),
      options: [
        { value: "all", label: t("allRegions") },
        ...unique("activationRegion"),
      ],
    },
    {
      name: "sort" as const,
      icon: ArrowDownWideNarrow,
      label: t("price"),
      options: [
        { value: "price_asc", label: t("priceLowToHigh") },
        { value: "price_desc", label: t("priceHighToLow") },
        { value: "rating", label: t("sellerRating") },
      ],
    },
  ];
  return (
    <div className={SELLER_FILTER_CLASS}>
      {fields.map(({ name, icon: Icon, label, options }) => (
        <label
          key={name}
          className="focus-within:ring-forest-400 relative flex h-[54px] min-w-0 items-center rounded-xl bg-[#242c38] text-gray-200 transition-colors focus-within:ring-2 hover:bg-[#2d3745]"
        >
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 h-4.5 w-4.5"
          />
          <select
            aria-label={label}
            value={filters[name]}
            onChange={(event) => onChange?.(name, event.target.value)}
            className="h-full w-full cursor-pointer appearance-none truncate rounded-xl bg-transparent pr-10 pl-12 text-sm outline-none"
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#242c38]"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-4 h-4 w-4 text-gray-400"
          />
        </label>
      ))}
      <button
        type="button"
        aria-label="Reset offer filters"
        onClick={onReset}
        className="focus-visible:outline-forest-400 flex h-[54px] w-[54px] items-center justify-center rounded-xl bg-[#242c38] text-gray-400 transition-colors hover:bg-[#2d3745] hover:text-white focus-visible:outline-2"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
