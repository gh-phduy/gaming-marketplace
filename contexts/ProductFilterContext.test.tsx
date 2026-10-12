import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  ProductFilterProvider,
  useProductFilter,
} from "./ProductFilterContext";

describe("ProductFilterContext", () => {
  it("should throw error if used outside provider", () => {
    // Suppress console.error for expected error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useProductFilter())).toThrow(
      "useProductFilter must be used within ProductFilterProvider",
    );

    consoleSpy.mockRestore();
  });

  it("should provide default values", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProductFilterProvider>{children}</ProductFilterProvider>
    );

    const { result } = renderHook(() => useProductFilter(), { wrapper });

    expect(result.current.priceRange).toEqual({ min: 0, max: Infinity });
    expect(result.current.selectedPlatforms).toEqual([]);
    expect(result.current.resetVersion).toBe(0);
  });

  it("should update priceRange", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProductFilterProvider>{children}</ProductFilterProvider>
    );

    const { result } = renderHook(() => useProductFilter(), { wrapper });

    act(() => {
      result.current.setPriceRange({ min: 10, max: 500 });
    });

    expect(result.current.priceRange).toEqual({ min: 10, max: 500 });
  });

  it("should update selectedPlatforms", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProductFilterProvider>{children}</ProductFilterProvider>
    );

    const { result } = renderHook(() => useProductFilter(), { wrapper });

    act(() => {
      result.current.setSelectedPlatforms(["PC", "PS5"]);
    });

    expect(result.current.selectedPlatforms).toEqual(["PC", "PS5"]);
  });

  it("should reset filters and increment resetVersion", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProductFilterProvider>{children}</ProductFilterProvider>
    );

    const { result } = renderHook(() => useProductFilter(), { wrapper });

    // Change state first
    act(() => {
      result.current.setPriceRange({ min: 10, max: 500 });
      result.current.setSelectedPlatforms(["PC"]);
    });

    // Then reset
    act(() => {
      result.current.resetProductFilters();
    });

    expect(result.current.priceRange).toEqual({ min: 0, max: Infinity });
    expect(result.current.selectedPlatforms).toEqual([]);
    expect(result.current.resetVersion).toBe(1);
  });
});
