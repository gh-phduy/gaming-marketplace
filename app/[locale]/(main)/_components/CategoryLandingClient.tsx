"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Gamepad2,
  ListFilter,
  RotateCw,
  Search,
  X,
} from "lucide-react";

export type CategoryIcon = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
}>;

export type LandingCategory = {
  name: string;
  products: string;
  filterId: string;
  href: string;
  icon: CategoryIcon;
  tone: string;
  image?: string;
  imagePosition?: string;
};

type SortKey =
  | "popular"
  | "products-desc"
  | "products-asc"
  | "alphabet-asc"
  | "alphabet-desc";

const sortOptions: { label: string; value: SortKey }[] = [
  { label: "Most popular", value: "popular" },
  { label: "Products: high to low", value: "products-desc" },
  { label: "Products: low to high", value: "products-asc" },
  { label: "Alphabet: A-Z", value: "alphabet-asc" },
  { label: "Alphabet: Z-A", value: "alphabet-desc" },
];

function parseProductCount(products: string) {
  return Number(products.replace(/\D/g, ""));
}

function buildCategoryHref(href: string, productTypeFilterId?: string) {
  if (!productTypeFilterId) return href;

  const url = new URL(href, "https://difmark.local");
  url.searchParams.set("productType", productTypeFilterId);

  const query = url.searchParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

function CategoryCard({
  category,
  productTypeFilterId,
}: {
  category: LandingCategory;
  productTypeFilterId?: string;
}) {
  const Icon = category.icon;
  const href = buildCategoryHref(category.href, productTypeFilterId);

  return (
    <Link
      href={href}
      className="group relative flex h-20 overflow-hidden rounded-lg border border-white/[0.03] bg-midnight-800 shadow-[0_12px_30px_rgba(4,8,14,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_18px_36px_rgba(4,8,14,0.28)] focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none"
    >
      {category.image && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-cover opacity-[0.42] saturate-[0.78] transition duration-300 group-hover:opacity-[0.55]"
          style={{
            backgroundImage: `url(${category.image})`,
            backgroundPosition: category.imagePosition ?? "center",
          }}
        />
      )}
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-r ${category.tone}`}
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(128deg,transparent_0%,transparent_42%,rgba(255,255,255,0.08)_43%,rgba(255,255,255,0.08)_44%,transparent_45%)] opacity-70"
      />

      <span className="relative flex min-w-0 items-center gap-5 px-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.08] text-dm-text-muted shadow-inner">
          <Icon className="size-6" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-lg leading-6 font-bold text-white">
            {category.name}
          </span>
          <span className="mt-1 block truncate text-sm leading-5 text-[#d6e1ff]">
            {category.products}
          </span>
        </span>
      </span>
    </Link>
  );
}

function PatternBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-70"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_8px,transparent_8px),linear-gradient(rgba(255,255,255,0.038)_8px,transparent_8px)] bg-[length:86px_86px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0_27px,rgba(255,255,255,0.045)_28px_34px,transparent_35px),linear-gradient(45deg,transparent_0_43%,rgba(255,255,255,0.045)_44%_50%,transparent_51%_100%)] bg-[length:172px_172px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,24,33,0.45)_0%,rgba(18,24,33,0.9)_62%,#141b24_100%)]" />
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const selectedOption =
    sortOptions.find((option) => option.value === value) ?? sortOptions[0];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-30">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-lg bg-[#222c3b]/95 px-5 text-left text-white shadow-[0_14px_26px_rgba(4,8,14,0.12)] ring-1 ring-white/[0.03] transition hover:bg-[#293345] focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none"
      >
        <span className="flex items-center gap-4">
          <ListFilter className="size-5 text-[#d8e0eb]" aria-hidden />
          <span className="text-base">{selectedOption.label}</span>
        </span>
        {isOpen ? (
          <ChevronUp className="size-5 text-white" aria-hidden />
        ) : (
          <ChevronDown className="size-5 text-dm-text-muted" aria-hidden />
        )}
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Sort categories"
          className="absolute top-[calc(100%+6px)] right-0 left-0 overflow-hidden rounded-lg bg-[#303a4a] py-0 text-base text-[#c9d0dc] shadow-[0_22px_44px_rgba(4,8,14,0.35)] ring-1 ring-black/10"
        >
          {sortOptions.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex h-12 w-full items-center border-l-[3px] px-5 text-left transition hover:bg-[#3a4658] focus-visible:outline-none ${
                  isSelected
                    ? "border-dm-accent-green bg-[#3a4658] text-white"
                    : "border-transparent"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CategoryLandingClient({
  title,
  description,
  categories,
  searchInputId,
  showMore = false,
  paginationPages,
  productTypeFilterId,
}: {
  title: string;
  description: string;
  categories: LandingCategory[];
  searchInputId: string;
  showMore?: boolean;
  paginationPages?: string[];
  productTypeFilterId?: string;
}) {
  const [sortBy, setSortBy] = useState<SortKey>("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCategories = useMemo(() => {
    const categoriesWithIndex = categories.map((category, index) => ({
      category,
      index,
    }));

    categoriesWithIndex.sort((left, right) => {
      switch (sortBy) {
        case "products-desc":
          return (
            parseProductCount(right.category.products) -
            parseProductCount(left.category.products)
          );
        case "products-asc":
          return (
            parseProductCount(left.category.products) -
            parseProductCount(right.category.products)
          );
        case "alphabet-asc":
          return left.category.name.localeCompare(right.category.name);
        case "alphabet-desc":
          return right.category.name.localeCompare(left.category.name);
        case "popular":
        default:
          return left.index - right.index;
      }
    });

    return categoriesWithIndex.map(({ category }) => category);
  }, [categories, sortBy]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleCategories = useMemo(() => {
    if (!normalizedSearchQuery) {
      return sortedCategories;
    }

    return sortedCategories.filter((category) =>
      category.name.toLowerCase().includes(normalizedSearchQuery),
    );
  }, [normalizedSearchQuery, sortedCategories]);

  return (
    <main
      id="main-content"
      className="relative flex min-h-[calc(100vh-80px)] w-full justify-center overflow-hidden bg-[#141b24] px-4 pb-24 text-dm-text-primary sm:px-6 lg:px-8"
    >
      <PatternBackdrop />

      <section className="relative z-10 w-full responsive pt-9 sm:pt-10">
        <div className="mx-auto max-w-[720px] text-center">
          <h1 className="text-[30px] leading-tight font-bold text-white sm:text-[34px]">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-[700px] text-sm leading-5 text-dm-text-muted">
            {description}
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_376px] lg:items-start">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="flex h-12 min-w-0 items-center gap-3 rounded-lg bg-[#222c3b]/95 px-4 text-dm-text-muted shadow-[0_14px_26px_rgba(4,8,14,0.12)] ring-1 ring-white/[0.03] focus-within:ring-dm-accent-green/45"
          >
            <Search className="size-6 shrink-0 text-[#d8e0eb]" aria-hidden />
            <label htmlFor={searchInputId} className="sr-only">
              Search by category name
            </label>
            <input
              id={searchInputId}
              name="name"
              type="search"
              placeholder="Search by Category name"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-dm-text-muted focus:outline-none sm:text-base"
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear category search"
                onClick={() => setSearchQuery("")}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-dm-text-muted transition hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </form>

          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {visibleCategories.length > 0 ? (
          <div
            aria-live="polite"
            className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-[30px] xl:gap-y-[30px]"
          >
            {visibleCategories.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                productTypeFilterId={productTypeFilterId}
              />
            ))}
          </div>
        ) : (
          <div
            role="status"
            className="mt-7 flex min-h-36 items-center justify-center rounded-lg border border-white/[0.04] bg-[#222c3b]/70 px-6 text-center text-dm-text-muted"
          >
            No categories found for &quot;{searchQuery.trim()}&quot;.
          </div>
        )}

        {visibleCategories.length > 0 && showMore ? (
          <button
            type="button"
            className="mt-7 flex h-11 w-full items-center justify-center gap-3 rounded-sm bg-[#222c3b]/95 text-xs font-bold text-white uppercase transition hover:bg-[#293345] focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none"
          >
            <RotateCw className="size-5" aria-hidden />
            Show more
          </button>
        ) : null}

        {visibleCategories.length > 0 && paginationPages?.length ? (
          <nav
            className="mt-7 flex items-center justify-center gap-1.5"
            aria-label={`${title} pages`}
          >
            {paginationPages.map((page, index) => (
              <button
                key={page}
                type="button"
                aria-current={index === 0 ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded-sm px-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none ${
                  index === 0
                    ? "bg-[#455a78] text-white"
                    : "bg-[#222c3b]/95 text-white hover:bg-[#293345]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="flex h-9 items-center justify-center gap-1 rounded-sm bg-[#222c3b]/95 px-3 text-sm font-semibold text-white transition hover:bg-[#293345] focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none"
            >
              Next
              <ChevronDown className="-rotate-90 size-4" aria-hidden />
            </button>
          </nav>
        ) : null}

        <div
          aria-hidden="true"
          className="absolute top-[350px] left-[-140px] hidden h-[520px] w-[520px] rounded-full bg-[#22364d]/[0.18] blur-3xl lg:block"
        />
        <Gamepad2
          aria-hidden="true"
          className="absolute right-4 bottom-12 hidden size-28 text-white/[0.015] xl:block"
        />
      </section>
    </main>
  );
}
