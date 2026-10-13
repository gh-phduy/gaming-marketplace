"use client";

import React, { useMemo } from "react";
import { List, SlidersHorizontal, X, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import ProductSidebar from "@/components/product/ProductSidebar";
import ProductGridItem from "@/components/product/ProductGridItem";
import { IoMdHome } from "react-icons/io";
import { FaChevronRight } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";
import Pagination from "@/components/shared/Pagination";
import { useProductDetail, FILTERS_COLLAPSED_HEIGHT } from "./useProductDetail";
import { ProductSortDropdown } from "./ProductDetailComponents";
import { useTranslations } from "next-intl";
import { ALL_PRICES, getVisiblePriceRange } from "@/lib/price-filter";

export default function ProductClient() {
  const t = useTranslations("product");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const {
    isLoading,
    products,
    priceProducts,
    platformProducts,
    priceCeiling,
    priceRange,
    setPriceRange,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    showAllFilters,
    setShowAllFilters,
    isOverflowing,
    filtersRef,
    paginatedProducts,
    totalPages,
    selectedPlatformFilters,
    primarySelectedPlatform,
    selectedPlatforms,
    setSelectedPlatforms,
    resetProductFilters,
  } = useProductDetail();
  const visiblePrice = getVisiblePriceRange(priceRange, priceCeiling);
  const sidebarProps = {
    products,
    priceProducts,
    platformProducts,
    onFilterChange: () => setCurrentPage(1),
  };

  function getSortLabelKey(value: string) {
    switch (value) {
      case "newer":
        return "sortNewer";
      case "older":
        return "sortOlder";
      case "name-asc":
        return "sortNameAsc";
      case "name-desc":
        return "sortNameDesc";
      case "price-asc":
        return "sortPriceAsc";
      case "price-desc":
        return "sortPriceDesc";
      case "popular":
      default:
        return "sortPopular";
    }
  }

  function translateFilterLabel(label: string, id: string) {
    switch (id) {
      case "game-keys":
        return tNav("gameKeys");
      case "console-games":
        return tNav("consoleGames");
      case "pc-games":
        return tNav("pcGames");
      case "mobile":
        return tNav("mobile");
      case "game-currency":
        return tNav("gameCurrency");
      case "game-accounts":
        return tNav("gameAccounts");
      case "game-items":
        return tNav("gameItems");
      case "power-leveling":
        return tNav("powerLeveling");
      case "software":
        return tNav("software");
      case "gift-cards":
        return tNav("giftCards");
      case "game-cards":
        return tNav("gameCards");
      default:
        return label;
    }
  }

  const translatedPlatformLabel = useMemo(() => {
    if (!primarySelectedPlatform) return "";
    const filterId =
      selectedPlatformFilters.find((f) => f.label === primarySelectedPlatform)
        ?.id || "";
    return translateFilterLabel(primarySelectedPlatform, filterId);
  }, [primarySelectedPlatform, selectedPlatformFilters, tNav]);

  return (
    <main id="main-content" className="flex min-h-[calc(100vh-4rem)] w-full bg-[#0d1117] font-sans text-white">
      {/* Desktop Sidebar — hidden below lg */}
      <aside className="hidden lg:block">
        <ProductSidebar {...sidebarProps} />
      </aside>

      {/* Main Content Area */}
      <div className="flex w-full min-w-0 flex-col gap-6 bg-midnight-850 px-3 py-4 sm:gap-8 sm:px-5 sm:py-6 md:px-6 lg:px-8 xl:px-10">
        {/* Header Group (Breadcrumb + Title) */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-steel-500 sm:text-base">
            <IoMdHome size={18} />
            <FaChevronRight size={12} />
            <span className="font-medium">{t("gameKeys")}</span>
            {translatedPlatformLabel && (
              <>
                <FaChevronRight size={12} />
                <span className="font-medium text-steel-300">
                  {translatedPlatformLabel}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">
            {translatedPlatformLabel
              ? `${translatedPlatformLabel} ${t("gameKeys").toLowerCase()}`
              : t("productsTitle")}
          </h1>
        </div>

        {/* Top Controls */}
        <div className="relative z-20 flex flex-col gap-3 sm:gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <IoSearch
              size={24}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
            />
            <Input
              placeholder={t("searchProductPlaceholder")}
              className="h-10 bg-midnight-750 pl-10 text-sm text-gray-300 sm:h-11 sm:text-base"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort / View / Filter toggle */}
          <div className="flex w-full items-center gap-2 lg:w-auto">
            {/* Mobile filter toggle */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-10 w-full flex-1 border-[#30363d] bg-midnight-700 px-3 text-steel-300 sm:h-11 sm:w-auto sm:flex-initial lg:hidden"
                  >
                    <SlidersHorizontal className="mr-2 h-5 w-5" />{" "}
                    {t("filters")}
                  </Button>
                }
              />
              <SheetContent
                side="left"
                className="w-[280px] overflow-y-auto border-[#30363d] bg-midnight-700 p-0 sm:w-[320px]"
              >
                <SheetHeader className="px-4 pt-4">
                  <SheetTitle className="text-white">{t("filters")}</SheetTitle>
                </SheetHeader>
                <ProductSidebar {...sidebarProps} />
              </SheetContent>
            </Sheet>

            <ProductSortDropdown
              value={sortBy}
              onChange={(nextSort) => {
                setSortBy(nextSort);
                setCurrentPage(1);
              }}
            />

            <Button
              variant="outline"
              className="hidden h-10 border-[#30363d] bg-midnight-700 px-3 text-steel-300 sm:inline-flex sm:h-11"
            >
              <List className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> {t("list")}
            </Button>
          </div>
        </div>

        {/* Filters Tag List */}
        <div className="relative z-10 flex gap-3 text-sm sm:gap-4 sm:text-base">
          <div className="min-w-0 flex-1">
            <div
              ref={filtersRef}
              className={cn(
                "flex flex-wrap items-center gap-2 overflow-hidden transition-all duration-300",
              )}
              style={{
                maxHeight: showAllFilters
                  ? filtersRef.current?.scrollHeight
                  : FILTERS_COLLAPSED_HEIGHT,
              }}
            >
              <span className="whitespace-nowrap text-gray-400">
                {t("chosenFilters")}
              </span>
              {searchTerm.trim() && (
                <span className="inline-flex items-center gap-1 rounded-full bg-midnight-500 px-2 py-1 text-xs font-medium text-steel-300 sm:text-sm">
                  &ldquo;{searchTerm.trim()}&rdquo;
                  <IoCloseSharp
                    className="cursor-pointer hover:text-white"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                  />
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-midnight-500 px-2 py-1 text-xs font-medium text-steel-300 sm:text-sm">
                {t(getSortLabelKey(sortBy))}
                <IoCloseSharp
                  className="cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy("popular");
                    setCurrentPage(1);
                  }}
                />
              </span>
              {selectedPlatformFilters.map((filter) => (
                <span
                  key={filter.id}
                  className="inline-flex items-center gap-1 rounded-full bg-midnight-500 px-2 py-1 text-xs font-medium text-steel-300 sm:text-sm"
                >
                  {translateFilterLabel(filter.label, filter.id)}
                  <IoCloseSharp
                    className="cursor-pointer hover:text-white"
                    onClick={() => {
                      setSelectedPlatforms(
                        selectedPlatforms.filter(
                          (platform) => platform !== filter.id,
                        ),
                      );
                      setCurrentPage(1);
                    }}
                  />
                </span>
              ))}
              {(priceRange.min > 0 || Number.isFinite(priceRange.max)) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-midnight-500 px-2 py-1 text-xs font-medium text-steel-300 sm:text-sm">
                  ${visiblePrice.min.toFixed(2)} - $
                  {visiblePrice.max.toFixed(2)}
                  <button
                    type="button"
                    aria-label="Clear price filter"
                    onClick={() => {
                      setPriceRange(ALL_PRICES);
                      setCurrentPage(1);
                    }}
                    className="hover:text-white"
                  >
                    <IoCloseSharp />
                  </button>
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSortBy("popular");
                setShowAllFilters(false);
                resetProductFilters();
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 text-xs whitespace-nowrap text-gray-400 hover:text-white sm:text-sm"
            >
              {t("clearAll")} <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            {isOverflowing && (
              <button
                onClick={() => setShowAllFilters(!showAllFilters)}
                className="text-xs whitespace-nowrap text-emerald-500 transition-colors hover:text-emerald-100 sm:text-sm"
              >
                {showAllFilters ? t("showLess") : t("showMore")}
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-video animate-pulse rounded-lg bg-midnight-750 sm:aspect-auto sm:h-[250px]"
                />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-[#30363d] bg-[#151c26]/50 px-6 py-24 text-center">
              <Ban className="mb-5 h-16 w-16 stroke-[1.2] text-slate-500/80" />
              <h2 className="mb-2 text-lg font-bold tracking-wider text-white uppercase">
                {t.has("noProductsFound")
                  ? t("noProductsFound")
                  : "NO PRODUCTS FOUND"}
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                {t.has("noProductsFoundDesc")
                  ? t("noProductsFoundDesc")
                  : "The product you were looking for was not found. Try refining your request."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product, index) => (
                <ProductGridItem
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  platform={product.platform}
                  eager={index < 2}
                />
              ))}
            </div>
          )}
        </div>

        {paginatedProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            previousLabel={t("back")}
            nextLabel={t("next")}
          />
        )}
      </div>
    </main>
  );
}
