"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ALL_PRICES } from "@/lib/price-filter";

/* ============================================
   TYPES
   ============================================ */

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFilterContextType {
  priceRange: PriceRange;
  setPriceRange: (range: PriceRange) => void;
  selectedPlatforms: string[];
  setSelectedPlatforms: (platforms: string[]) => void;
  resetVersion: number;
  resetProductFilters: () => void;
}

/* ============================================
   CONTEXT
   ============================================ */

const ProductFilterContext = createContext<
  ProductFilterContextType | undefined
>(undefined);

/* ============================================
   PROVIDER
   ============================================ */

interface ProductFilterProviderProps {
  children: ReactNode;
}

const DEFAULT_PRICE_RANGE: PriceRange = {
  ...ALL_PRICES,
};

export function ProductFilterProvider({
  children,
}: ProductFilterProviderProps) {
  const [priceRange, setPriceRange] = useState<PriceRange>(DEFAULT_PRICE_RANGE);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [resetVersion, setResetVersion] = useState(0);

  const resetProductFilters = () => {
    setPriceRange(DEFAULT_PRICE_RANGE);
    setSelectedPlatforms([]);
    setResetVersion((version) => version + 1);
  };

  return (
    <ProductFilterContext.Provider
      value={{
        priceRange,
        setPriceRange,
        selectedPlatforms,
        setSelectedPlatforms,
        resetVersion,
        resetProductFilters,
      }}
    >
      {children}
    </ProductFilterContext.Provider>
  );
}

/* ============================================
   HOOK
   ============================================ */

export function useProductFilter() {
  const context = useContext(ProductFilterContext);
  if (!context) {
    throw new Error(
      "useProductFilter must be used within ProductFilterProvider",
    );
  }
  return context;
}
