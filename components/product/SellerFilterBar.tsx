"use client";

import { useTranslations } from "next-intl";
import { Award, Gamepad2, MapPin, ArrowDownWideNarrow, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <Select
          key={name}
          items={options}
          value={filters[name]}
          onValueChange={(value) => {
            if (value !== null) onChange?.(name, value);
          }}
        >
          <SelectTrigger
            aria-label={label}
            data-filter-active={filters[name] !== DEFAULT_OFFER_FILTERS[name]}
            className="group h-[54px] w-full min-w-0 cursor-pointer gap-3 rounded-xl border border-white/5 bg-[#242c38] px-4 text-sm text-gray-200 shadow-sm transition-colors hover:border-white/15 hover:bg-[#2d3745] focus-visible:border-dm-accent-green/60 focus-visible:ring-2 focus-visible:ring-dm-accent-green/20 data-[filter-active=true]:border-dm-accent-green/30 data-[popup-open]:border-dm-accent-green/60 data-[popup-open]:bg-[#2a3442] [&>svg:last-child]:ml-auto [&>svg:last-child]:text-gray-400 [&>svg:last-child]:transition-transform [&[data-popup-open]>svg:last-child]:rotate-180 [&[data-popup-open]>svg:last-child]:text-dm-accent-green"
          >
            <Icon
              aria-hidden="true"
              className="size-4.5 shrink-0 text-gray-400 group-data-[filter-active=true]:text-dm-accent-green group-data-[popup-open]:text-dm-accent-green"
            />
            <SelectValue className="min-w-0 truncate" />
          </SelectTrigger>
          <SelectContent
            align="start"
            alignItemWithTrigger={false}
            sideOffset={8}
            className="max-h-[min(320px,var(--available-height))] rounded-xl border border-white/10 bg-[#242c38] p-1.5 text-gray-200 shadow-[0_16px_40px_rgba(0,0,0,0.4)] ring-0 [&_[data-slot=select-scroll-down-button]]:bg-[#242c38] [&_[data-slot=select-scroll-up-button]]:bg-[#242c38]"
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="min-h-11 cursor-pointer rounded-lg border border-transparent py-2.5 pr-10 pl-3 text-sm text-gray-300 transition-colors hover:bg-white/5 focus:bg-white/5 focus:text-white data-[highlighted]:bg-white/5 data-[highlighted]:text-white data-[selected]:border-dm-accent-green/15 data-[selected]:bg-dm-accent-green/10 data-[selected]:text-dm-accent-green data-[selected]:[&_svg]:text-dm-accent-green data-[selected]:[&>span]:text-dm-accent-green [&>span:last-child]:right-3 [&>span:last-child]:text-dm-accent-green"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
