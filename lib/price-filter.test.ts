import { describe, expect, it } from "vitest";
import {
  ALL_PRICES,
  getPriceCeiling,
  getPriceHistogram,
  getPricePresets,
  getVisiblePriceRange,
} from "./price-filter";
import {
  filterListingProducts,
  type Product,
} from "@/app/[locale]/(checkout)/product/_lib/product-listing";

describe("catalog price distribution", () => {
  it("uses actual prices, counts each price once, and includes the upper edge", () => {
    const histogram = getPriceHistogram([0, 5, 5, 10, 19, 20, NaN, -1], 20, 4);
    expect(histogram.bins).toEqual([1, 2, 1, 2]);
    expect(getPriceHistogram([2, 18], 20, 4).line).not.toBe(histogram.line);
    expect(getPriceHistogram([], 20, 4).bins).toEqual([0, 0, 0, 0]);
  });
  it("derives the axis and real preset counts, including empty catalogs", () => {
    expect(getPriceCeiling([10, 59.99, NaN, -1])).toBe(60);
    expect(getPriceCeiling([])).toBe(1);
    expect(getVisiblePriceRange(ALL_PRICES, 60)).toEqual({ min: 0, max: 60 });
    expect(getVisiblePriceRange({ min: 65, max: 90 }, 60)).toEqual({
      min: 60,
      max: 60,
    });
    expect(getPricePresets([3, 15, 40, 55], 60)).toEqual([
      { min: 0, max: 6, label: "$ 0 - $ 6", count: 1 },
      { min: 6, max: 30, label: "$ 6 - $ 30", count: 1 },
      { min: 30, max: 60, label: "$ 30 - $ 60", count: 2 },
    ]);
  });
  it("combines inclusive decimal prices with multiple platform tags and does not cap the default catalog", () => {
    const products: Product[] = [
      { id: 1, title: "First", image: "", platform: "PC, PS5", price: 29.99 },
      {
        id: 2,
        title: "Second",
        image: "",
        platform: "PS4, Nintendo Switch",
        price: 30,
      },
      {
        id: 3,
        title: "Third",
        image: "",
        platform: "PC, Xbox One",
        price: 2000,
      },
    ];
    expect(
      filterListingProducts(products, { priceRange: ALL_PRICES }),
    ).toHaveLength(3);
    expect(
      filterListingProducts(products, {
        selectedFilters: ["pc", "ps4"],
        priceRange: { min: 29.99, max: 30 },
      }).map((p) => p.id),
    ).toEqual([1, 2]);
    expect(
      filterListingProducts(products, {
        selectedFilters: ["ps5"],
        searchTerm: "first",
        priceRange: { min: 30, max: 40 },
      }),
    ).toEqual([]);
  });
});
