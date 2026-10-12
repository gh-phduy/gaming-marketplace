"use client";

import { useEffect, useMemo, useState } from "react";
import type { SellerProfile } from "../seller-profile.data";
import SellerStoreFilters from "./store/SellerStoreFilters";
import SellerStoreOfferRow from "./store/SellerStoreOfferRow";
import SellerStoreFooter from "./store/SellerStoreFooter";
import { useTranslations } from "next-intl";
import { getProductPlatforms, matchesPlatformFilter } from "@/lib/platforms";

interface SellerStorePanelProps {
  profile: SellerProfile;
  onNotify: (message: string) => void;
}

type StoreViewMode = "list" | "grid";

export default function SellerStorePanel({
  profile,
  onNotify,
}: SellerStorePanelProps) {
  const t = useTranslations("user");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<StoreViewMode>("list");

  const categoryOptions = useMemo(() => {
    const platforms = new Set<string>();

    profile.offers.forEach((offer) => {
      getProductPlatforms(offer.data.platform).forEach((value) =>
        platforms.add(value),
      );
    });

    return Array.from(platforms).sort((a, b) => a.localeCompare(b));
  }, [profile.offers]);

  const filteredOffers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const base = profile.offers.filter((offer) => {
      const matchesCategory =
        category === "all" ||
        matchesPlatformFilter(offer.data.platform, category);

      if (!matchesCategory) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        offer.data.name.toLowerCase().includes(keyword) ||
        offer.data.platform.toLowerCase().includes(keyword)
      );
    });

    if (sortBy === "price-asc") {
      return [...base].sort((a, b) => a.data.price - b.data.price);
    }

    if (sortBy === "price-desc") {
      return [...base].sort((a, b) => b.data.price - a.data.price);
    }

    if (sortBy === "title") {
      return [...base].sort((a, b) => a.data.name.localeCompare(b.data.name));
    }

    return base;
  }, [category, profile.offers, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOffers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOffers.slice(start, start + pageSize);
  }, [currentPage, filteredOffers, pageSize]);

  return (
    <section className="space-y-4">
      <SellerStoreFilters
        searchTerm={searchTerm}
        onChangeSearchTerm={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        category={category}
        onChangeCategory={(value) => {
          setCategory(value);
          setCurrentPage(1);
        }}
        categoryOptions={categoryOptions}
        sortBy={sortBy}
        onChangeSortBy={(value) => {
          setSortBy(value);
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onToggleViewMode={() =>
          setViewMode((currentMode) =>
            currentMode === "list" ? "grid" : "list",
          )
        }
      />

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
            : "space-y-2"
        }
      >
        {paginatedOffers.length === 0 && (
          <div className="rounded-lg border border-midnight-700 bg-midnight-800 px-4 py-8 text-center text-steel-500 md:col-span-2 xl:col-span-3">
            {t("noProductsMatchFilters")}
          </div>
        )}

        {paginatedOffers.map((offer) => (
          <SellerStoreOfferRow
            key={offer.data.id}
            offer={offer}
            viewMode={viewMode}
            onAddedToCart={() => onNotify(t("productAddedToCart"))}
          />
        ))}
      </div>

      <SellerStoreFooter
        totalProducts={filteredOffers.length}
        averagePrice={profile.averagePrice}
        currency={profile.currency}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onChangePageSize={(value) => {
          setPageSize(value);
          setCurrentPage(1);
        }}
      />
    </section>
  );
}
