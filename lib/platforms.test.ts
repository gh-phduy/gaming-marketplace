import { describe, expect, it } from "vitest";
import {
  getPlatformFamily,
  matchesPlatformFilter,
  normalizePlatformId,
  getProductPlatforms,
} from "./platforms";
import {
  formatFilterLabel,
  normalizeFilterId,
  productMatchesSelectedFilter,
  type Product,
} from "@/app/[locale]/(checkout)/product/_lib/product-listing";

const game = (platform: string): Product => ({
  id: 1,
  title: "Demo game",
  price: 10,
  image: "/cover.jpg",
  platform,
  type: "game-keys",
  filters: ["game-keys", platform, "Global"],
});

describe("catalog platform filters", () => {
  it("matches every tag in a multi-platform listing without splitting Xbox X/S", () => {
    const multi = game("PC, PS5, Xbox Series X/S");
    expect(getProductPlatforms(multi.platform)).toEqual([
      "PC",
      "PS5",
      "Xbox Series X/S",
    ]);
    for (const filter of [
      "pc",
      "ps5",
      "xbox-series-x",
      "console-games",
      "pc-games",
      "playstation",
    ])
      expect(productMatchesSelectedFilter(multi, filter)).toBe(true);
    for (const filter of ["ps4", "xbox-one", "nintendo-switch"])
      expect(productMatchesSelectedFilter(multi, filter)).toBe(false);
    expect(
      getProductPlatforms(["PS5, PC", "PlayStation 5", "Xbox Series X/S"]),
    ).toEqual(["PS5", "PC", "Xbox Series X/S"]);
    expect(getProductPlatforms(null)).toEqual([]);
    expect(
      matchesPlatformFilter(["PS4", "Nintendo Switch"], "nintendo-switch"),
    ).toBe(true);
  });
  it("keeps console generations separate while accepting their stored labels", () => {
    expect(productMatchesSelectedFilter(game("PS5"), "ps5")).toBe(true);
    expect(productMatchesSelectedFilter(game("PS4"), "ps5")).toBe(false);
    expect(productMatchesSelectedFilter(game("PlayStation 4"), "ps4")).toBe(
      true,
    );
    expect(
      productMatchesSelectedFilter(game("Xbox Series X/S"), "xbox-series-x"),
    ).toBe(true);
    expect(
      productMatchesSelectedFilter(game("Xbox One"), "xbox-series-x"),
    ).toBe(false);
    expect(
      productMatchesSelectedFilter(game("Nintendo Switch"), "nintendo-switch"),
    ).toBe(true);
    expect(productMatchesSelectedFilter(game("PC"), "ps5")).toBe(false);
  });
  it("preserves broad platform and product-type links", () => {
    expect(productMatchesSelectedFilter(game("PS4"), "playstation")).toBe(true);
    expect(productMatchesSelectedFilter(game("PS5"), "playstation")).toBe(true);
    expect(normalizeFilterId("Xbox Live")).toBe("xbox");
    expect(productMatchesSelectedFilter(game("Xbox One"), "xbox")).toBe(true);
    expect(productMatchesSelectedFilter(game("Steam"), "pc")).toBe(true);
    expect(productMatchesSelectedFilter(game("PC"), "pc-games")).toBe(true);
    expect(productMatchesSelectedFilter(game("PS5"), "pc-games")).toBe(false);
    expect(productMatchesSelectedFilter(game("PS5"), "console-games")).toBe(
      true,
    );
    expect(productMatchesSelectedFilter(game("PC"), "console-games")).toBe(
      false,
    );
    expect(productMatchesSelectedFilter(game("PS5"), "game-keys")).toBe(true);
  });
  it("normalizes equivalent names and does not label unknown platforms as PC", () => {
    expect(normalizePlatformId("PlayStation 5")).toBe("ps5");
    expect(normalizePlatformId("Xbox Series X/S")).toBe("xbox-series-x");
    expect(getPlatformFamily("PS5")).toBe("playstation");
    expect(getPlatformFamily("Nintendo Switch")).toBe("nintendo");
    expect(getPlatformFamily("Custom service")).toBe("unknown");
    expect(matchesPlatformFilter("Custom service", "pc")).toBe(false);
    expect(formatFilterLabel("ps5")).toBe("PlayStation 5");
  });
});
