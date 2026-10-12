"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProductFilter } from "@/contexts/ProductFilterContext";
import { CATALOG_PLATFORMS, matchesPlatformFilter } from "@/lib/platforms";
import PlatformBadge from "@/components/shared/PlatformBadge";

export default function SidebarPlatformFilter({
  products,
  onFilterChange,
}: {
  products: { platform: string | string[] }[];
  onFilterChange?: () => void;
}) {
  const t = useTranslations("product");
  const { selectedPlatforms, setSelectedPlatforms, resetVersion } =
    useProductFilter();
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
  const id = useId();
  useEffect(() => setSearch(""), [resetVersion]);
  const options = useMemo(
    () =>
      CATALOG_PLATFORMS.map((platform) => ({
        ...platform,
        count: products.filter((product) =>
          matchesPlatformFilter(product.platform, platform.id),
        ).length,
      })),
    [products],
  );
  const visible = options.filter((platform) =>
    [platform.label, platform.value, platform.id]
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const selectedCount = options.filter((platform) =>
    selectedPlatforms.includes(platform.id),
  ).length;
  return (
    <section
      className="w-full border-t border-[#3b4554]"
      aria-label={t("platform")}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex h-[66px] w-full items-center justify-between gap-2 text-left text-lg font-bold text-white"
      >
        <span className="flex items-center gap-2">
          {t("platform")}
          {selectedCount > 0 && (
            <span className="rounded-full bg-midnight-600 px-2 text-sm">
              {selectedCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={
            "size-5 transition-transform " + (open ? "rotate-180" : "")
          }
        />
      </button>
      {open && (
        <div id={id} className="space-y-3 pb-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              aria-label={t("searchPlatform")}
              placeholder={t("searchPlatform")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded bg-midnight-600 pr-3 pl-9 text-sm text-white placeholder:text-gray-400 focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            {visible.map((platform) => (
              <label
                key={platform.id}
                className="flex min-h-10 cursor-pointer items-center gap-3 rounded px-2 hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  aria-label={platform.label}
                  checked={selectedPlatforms.includes(platform.id)}
                  onChange={() => {
                    setSelectedPlatforms(
                      selectedPlatforms.includes(platform.id)
                        ? selectedPlatforms.filter((id) => id !== platform.id)
                        : [...selectedPlatforms, platform.id],
                    );
                    onFilterChange?.();
                  }}
                  className="size-4 shrink-0 cursor-pointer accent-[#65c756]"
                />
                <PlatformBadge platform={platform.value} size={15} />
                <span className="min-w-0 flex-1 text-sm text-gray-200">
                  {platform.label}
                </span>
                <span
                  data-platform-count={platform.id}
                  className="text-xs text-gray-400 tabular-nums"
                >
                  {platform.count}
                </span>
              </label>
            ))}
            {!visible.length && (
              <p className="py-2 text-sm text-gray-400">
                {t("noFiltersFound")}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
