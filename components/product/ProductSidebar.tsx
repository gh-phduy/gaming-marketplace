"use client";

import { useMemo } from "react";
import SidebarPriceFilter from "./sidebar/SidebarPriceFilter";
import SidebarPlatformFilter from "./sidebar/SidebarPlatformFilter";
import { getPriceCeiling } from "@/lib/price-filter";

type SidebarProduct = { price: number; platform: string | string[] };
const EMPTY_PRODUCTS: SidebarProduct[] = [];

export default function ProductSidebar({
  products = EMPTY_PRODUCTS,
  priceProducts = products,
  platformProducts = products,
  onFilterChange,
}: {
  products?: SidebarProduct[];
  priceProducts?: SidebarProduct[];
  platformProducts?: SidebarProduct[];
  onFilterChange?: () => void;
}) {
  const ceiling = useMemo(
    () => getPriceCeiling(products.map((product) => product.price)),
    [products],
  );
  const prices = useMemo(
    () => priceProducts.map((product) => product.price),
    [priceProducts],
  );
  return (
    <div className="flex h-full w-full shrink-0 flex-col items-center space-y-5 bg-midnight-700 p-4 pt-6 lg:w-[270px]">
      <SidebarPriceFilter
        prices={prices}
        ceiling={ceiling}
        onFilterChange={onFilterChange}
      />
      <SidebarPlatformFilter
        products={platformProducts}
        onFilterChange={onFilterChange}
      />
    </div>
  );
}
