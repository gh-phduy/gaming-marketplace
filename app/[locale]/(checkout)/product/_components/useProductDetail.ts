"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useProductFilter } from "@/contexts/ProductFilterContext";
import { getPriceCeiling } from "@/lib/price-filter";
import {
  normalizeFilterId,
  formatFilterLabel,
  getFilterQueryValues,
  filterListingProducts,
  ROUTE_PRODUCT_TYPE_FILTERS,
} from "../_lib/product-listing";
export { normalizeFilterId, formatFilterLabel } from "../_lib/product-listing";

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  platform: string | string[];
  platformLabel?: string;
  type?: string;
  productType?: string;
  category?: string;
  genre?: string;
  filters?: string[];
}

export type ProductSortKey =
  | "newer"
  | "older"
  | "popular"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export const SORT_OPTIONS: { label: string; value: ProductSortKey }[] = [
  { label: "Newer first", value: "newer" },
  { label: "Older first", value: "older" },
  { label: "Most popular", value: "popular" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

export const FILTERS_COLLAPSED_HEIGHT = 36;
export const ITEMS_PER_PAGE = 8;

const mapDbProductToClientProduct = (row: any): Product => {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    image: row.image_url || "/cyberpunk_2077.jpg",
    platform: row.platform || "PC",
    platformLabel: row.platform || "PC",
    type: row.category,
    productType: row.category,
    category: row.category,
    filters: [row.category, row.platform, row.region].filter(Boolean),
  };
};

const fetchListingProducts = async ({
  signal,
}: { signal?: AbortSignal } = {}): Promise<Product[]> => {
  let query = supabase.from("products").select("id,title,price,image_url,platform,category,region").eq("status", "published");

  if (signal) {
    query = query.abortSignal(signal);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products from Supabase:", error);
    throw error;
  }

  return (data || []).map(mapDbProductToClientProduct);
};

export function useProductDetail() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["listing-products"],
    queryFn: fetchListingProducts,
  });

  const {
    priceRange,
    setPriceRange,
    resetProductFilters,
    selectedPlatforms,
    setSelectedPlatforms,
  } = useProductFilter();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductSortKey>("popular");
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [hasLoadedUrlFilters, setHasLoadedUrlFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialSearch =
      searchParams.get("name") || searchParams.get("search") || "";
    const initialPage = Number(searchParams.get("page") || "1");
    const initialPlatforms = Array.from(
      new Set(getFilterQueryValues(searchParams)),
    );

    setSearchTerm(initialSearch);
    setSelectedPlatforms(initialPlatforms);
    setCurrentPage(
      Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1,
    );
    setHasLoadedUrlFilters(true);
  }, [searchParams, setSelectedPlatforms]);

  useEffect(() => {
    if (!hasLoadedUrlFilters) {
      return;
    }

    const trimmedSearchTerm = searchTerm.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmedSearchTerm) {
      params.set("name", trimmedSearchTerm);
    } else {
      params.delete("name");
    }
    params.delete("search");
    params.delete("category");
    params.delete("platform");
    params.delete("productType");
    params.delete("type");
    params.delete("genre");
    params.delete("brand");
    selectedPlatforms.forEach((platform) => {
      if (ROUTE_PRODUCT_TYPE_FILTERS.has(platform)) {
        params.append("productType", platform);
      } else {
        params.append("platform", platform);
      }
    });

    if (currentPage > 1) {
      params.set("page", String(currentPage));
    } else {
      params.delete("page");
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) {
      return;
    }

    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [
    currentPage,
    hasLoadedUrlFilters,
    pathname,
    router,
    searchParams,
    searchTerm,
    selectedPlatforms,
  ]);

  useEffect(() => {
    if (filtersRef.current) {
      setIsOverflowing(
        filtersRef.current.scrollHeight > FILTERS_COLLAPSED_HEIGHT + 4,
      );
    }
  }, [products, searchTerm, selectedPlatforms, sortBy]);

  // Price distribution ignores the selected price range so the graph remains
  // stable while dragging. Platform counts ignore selected platforms, but use
  // the current search, category, and price range.
  const priceProducts = useMemo(
    () =>
      filterListingProducts(products, {
        searchTerm,
        selectedFilters: selectedPlatforms,
      }),
    [products, searchTerm, selectedPlatforms],
  );
  const platformProducts = useMemo(
    () =>
      filterListingProducts(products, {
        searchTerm,
        selectedFilters: selectedPlatforms.filter((id) =>
          ROUTE_PRODUCT_TYPE_FILTERS.has(id),
        ),
        priceRange,
      }),
    [products, searchTerm, selectedPlatforms, priceRange],
  );
  const filteredProducts = useMemo(
    () =>
      priceProducts.filter(
        (product) =>
          product.price >= priceRange.min && product.price <= priceRange.max,
      ),
    [priceProducts, priceRange],
  );
  const priceCeiling = useMemo(
    () => getPriceCeiling(products.map((product) => product.price)),
    [products],
  );

  const sortedProducts = useMemo(() => {
    const indexedProducts = filteredProducts.map((product, index) => ({
      product,
      index,
    }));

    indexedProducts.sort((left, right) => {
      switch (sortBy) {
        case "newer":
          return right.product.id - left.product.id;
        case "older":
          return left.product.id - right.product.id;
        case "name-asc":
          return left.product.title.localeCompare(right.product.title);
        case "name-desc":
          return right.product.title.localeCompare(left.product.title);
        case "price-asc":
          return left.product.price - right.product.price;
        case "price-desc":
          return right.product.price - left.product.price;
        case "popular":
        default:
          return left.index - right.index;
      }
    });

    return indexedProducts.map(({ product }) => product);
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedProducts]);

  const selectedPlatformFilters = useMemo(
    () =>
      selectedPlatforms.map((platform) => ({
        id: platform,
        label: formatFilterLabel(platform),
      })),
    [selectedPlatforms],
  );

  const primarySelectedPlatform =
    selectedPlatformFilters.find(
      (filter) => !ROUTE_PRODUCT_TYPE_FILTERS.has(filter.id),
    )?.label ?? selectedPlatformFilters[0]?.label;

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ??
    "Most popular";

  return {
    products,
    priceProducts,
    platformProducts,
    priceCeiling,
    priceRange,
    setPriceRange,
    isLoading,
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
    filteredProducts,
    paginatedProducts,
    totalPages,
    selectedPlatformFilters,
    primarySelectedPlatform,
    selectedSortLabel,
    selectedPlatforms,
    setSelectedPlatforms,
    resetProductFilters,
  };
}
