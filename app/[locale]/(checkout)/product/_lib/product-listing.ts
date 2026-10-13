import { PRODUCT_TYPES_DATA } from "@/components/product/sidebar/filter-data";
import { supabase } from "@/lib/supabase";
import type { PriceRange } from "@/lib/price-filter";
import {
  CATALOG_PLATFORMS,
  getPlatformFamily,
  getProductPlatforms,
  isCatalogPlatformFilter,
  matchesPlatformFilter,
  normalizePlatformId,
} from "@/lib/platforms";

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

export const ITEMS_PER_PAGE = 8;
export const FILTERS_COLLAPSED_HEIGHT = 36;

export const SORT_OPTIONS: { label: string; value: ProductSortKey }[] = [
  { label: "Newer first", value: "newer" },
  { label: "Older first", value: "older" },
  { label: "Most popular", value: "popular" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

const PRODUCT_FILTER_LABEL_BY_ID = new Map(
  PRODUCT_TYPES_DATA.flatMap((type) =>
    type.subItems.map((subItem) => [subItem.id, subItem.label] as const),
  ),
);

const ROUTE_PRODUCT_TYPE_LABEL_BY_ID = new Map<string, string>([
  ["game-keys", "Game Keys"],
  ["console-games", "Console Games"],
  ["pc-games", "PC Games"],
  ["mobile", "Mobile"],
  ["game-currency", "Game Currency"],
  ["game-accounts", "Game Accounts"],
  ["game-items", "Game Items"],
  ["power-leveling", "Power Leveling"],
  ["software", "Software"],
  ["gift-cards", "Gift Cards"],
  ["game-cards", "Game Cards"],
]);

const FILTER_LABEL_BY_ID = new Map<string, string>([
  ...PRODUCT_FILTER_LABEL_BY_ID,
  ...ROUTE_PRODUCT_TYPE_LABEL_BY_ID,
  ...CATALOG_PLATFORMS.map(
    (platform) => [platform.id, platform.label] as const,
  ),
]);

const PLATFORM_QUERY_ALIASES: Record<string, string> = {
  "battle.net": "battle-net",
  battlenet: "battle-net",
  "battle-net": "battle-net",
  "electronic-arts": "ea",
  "epic-games": "epic",
};

export const ROUTE_PRODUCT_TYPE_FILTERS = new Set(
  ROUTE_PRODUCT_TYPE_LABEL_BY_ID.keys(),
);

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

export async function fetchListingProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,title,price,image_url,platform,category,region")
    .eq("status", "published");

  if (error) {
    console.error("Error fetching products from Supabase:", error);
    throw error;
  }

  return (data || []).map(mapDbProductToClientProduct);
}

export function normalizeFilterId(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizePlatformId(PLATFORM_QUERY_ALIASES[normalized] ?? normalized);
}

export function formatFilterLabel(filterId: string) {
  return (
    FILTER_LABEL_BY_ID.get(filterId) ??
    filterId
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function getFilterQueryValues(
  searchParams: Pick<URLSearchParams, "getAll">,
) {
  return [
    ...searchParams.getAll("productType"),
    ...searchParams.getAll("type"),
    ...searchParams.getAll("platform"),
    ...searchParams.getAll("category"),
    ...searchParams.getAll("genre"),
    ...searchParams.getAll("brand"),
  ]
    .flatMap((value) => value.split(","))
    .map(normalizeFilterId)
    .filter(Boolean);
}

function getProductFilterValues(product: Product) {
  const platformValues = getProductPlatforms(product.platform);
  const explicitFilters = product.filters ?? [];

  return [
    ...explicitFilters,
    ...platformValues,
    product.platformLabel,
    product.type,
    product.productType,
    product.category,
    product.genre,
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeFilterId);
}

export function productMatchesSelectedFilter(
  product: Product,
  selectedFilter: string,
) {
  const platformValues = getProductPlatforms(product.platform);
  if (isCatalogPlatformFilter(selectedFilter))
    return platformValues.some((platform) =>
      matchesPlatformFilter(platform, selectedFilter),
    );
  if (selectedFilter === "pc-games")
    return platformValues.some(
      (platform) => getPlatformFamily(platform) === "pc",
    );
  if (selectedFilter === "console-games")
    return platformValues.some((platform) =>
      ["playstation", "xbox", "nintendo"].includes(getPlatformFamily(platform)),
    );
  const productFilterValues = getProductFilterValues(product);
  const selectedLabel = FILTER_LABEL_BY_ID.get(selectedFilter);
  const selectedLabelId = selectedLabel
    ? normalizeFilterId(selectedLabel)
    : selectedFilter;

  return productFilterValues.some((filterValue) => {
    return (
      filterValue === selectedFilter ||
      filterValue === selectedLabelId ||
      filterValue.includes(selectedFilter) ||
      selectedFilter.includes(filterValue)
    );
  });
}

export function filterListingProducts(
  products: Product[],
  {
    searchTerm = "",
    selectedFilters = [],
    priceRange,
  }: {
    searchTerm?: string;
    selectedFilters?: string[];
    priceRange?: PriceRange;
  },
) {
  const search = searchTerm.trim().toLowerCase();
  const types = selectedFilters.filter((id) =>
    ROUTE_PRODUCT_TYPE_FILTERS.has(id),
  );
  const secondary = selectedFilters.filter(
    (id) => !ROUTE_PRODUCT_TYPE_FILTERS.has(id),
  );
  return products.filter((product) => {
    if (
      priceRange &&
      (product.price < priceRange.min || product.price > priceRange.max)
    )
      return false;
    if (
      types.length &&
      !types.some((id) => productMatchesSelectedFilter(product, id))
    )
      return false;
    if (
      secondary.length &&
      !secondary.some((id) => productMatchesSelectedFilter(product, id))
    )
      return false;
    const text = [
      product.title,
      ...getProductPlatforms(product.platform),
      product.platformLabel,
      product.type,
      product.productType,
      product.category,
      product.genre,
      ...(product.filters ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return !search || text.includes(search);
  });
}

export function sortProducts(products: Product[], sortBy: ProductSortKey) {
  const indexedProducts = products.map((product, index) => ({
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
}
