"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trophy,
  X,
} from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import type { DirectorySeller } from "@/lib/seller-directory";
import { getSellerProfilePath } from "./seller-profile.route";

const copy = {
  en: {
    title: "Trusted sellers",
    intro: "Discover the stores our gaming community loves.",
    subtitle:
      "Compare ratings, explore their stores, and find your next great deal.",
    recommended: "Recommended sellers",
    search: "Search by seller’s name",
    categories: "All categories",
    popular: "Most popular",
    rating: "Highest rated",
    name: "Name: A–Z",
    reset: "Reset filters",
    rank: "Rank",
    reviews: "reviews",
    sales: "sold",
    more: "Show more",
    empty: "No sellers found",
    hint: "Try another name or reset your filters.",
    size: "Sellers per page",
    previous: "Previous sellers",
    next: "Next sellers",
    toggle: "Toggle recommended sellers",
    demo: "Preview data: some ratings, review counts and sales are simulated.",
  },
  vi: {
    title: "Người bán uy tín",
    intro: "Khám phá những cửa hàng được cộng đồng game thủ yêu thích.",
    subtitle:
      "So sánh đánh giá, khám phá cửa hàng và tìm ưu đãi phù hợp với bạn.",
    recommended: "Người bán đề xuất",
    search: "Tìm theo tên người bán",
    categories: "Tất cả danh mục",
    popular: "Phổ biến nhất",
    rating: "Đánh giá cao nhất",
    name: "Tên: A–Z",
    reset: "Đặt lại bộ lọc",
    rank: "Hạng",
    reviews: "đánh giá",
    sales: "đã bán",
    more: "Xem thêm",
    empty: "Không tìm thấy người bán",
    hint: "Thử tên khác hoặc đặt lại bộ lọc.",
    size: "Số người bán mỗi trang",
    previous: "Người bán trước",
    next: "Người bán tiếp theo",
    toggle: "Ẩn/hiện người bán đề xuất",
    demo: "Dữ liệu xem trước: một số điểm đánh giá, lượt đánh giá và giao dịch là dữ liệu mẫu.",
  },
};
type Labels = typeof copy.en;
const flags: Record<string, string> = {
  Vietnam: "vn",
  "Viet Nam": "vn",
  France: "fr",
  Finland: "fi",
  Germany: "de",
  Spain: "es",
  Turkey: "tr",
  "United Kingdom": "en",
};

function SellerCard({
  seller,
  featured = false,
  labels,
  format,
}: {
  seller: DirectorySeller;
  featured?: boolean;
  labels: Labels;
  format: Intl.NumberFormat;
}) {
  return (
    <Link
      prefetch={false}
      href={getSellerProfilePath(seller.id)}
      className={`group relative flex min-w-0 items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-[#3b485d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-500 ${featured ? "min-h-[92px] bg-[#39465b]" : "min-h-[118px] bg-[#2d3544]"}`}
    >
      <div className="relative h-[72px] w-[72px] shrink-0">
        {!seller.avatar || seller.avatar.includes("avt-placeholder") ? (
          <span
            className="flex h-full w-full items-center justify-center rounded-full border border-white/10 text-xl font-bold tracking-wide shadow-inner"
            style={{
              background: `linear-gradient(135deg, hsl(${(seller.name.charCodeAt(0) * 19) % 360} 45% 38%), #182131)`,
            }}
            aria-hidden="true"
          >
            {seller.name
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </span>
        ) : (
          <Image
            src={seller.avatar}
            alt=""
            fill
            sizes="72px"
            className="rounded-full object-cover"
          />
        )}
        {!featured ? (
          <span className="absolute -bottom-1 left-1 flex items-center gap-1 rounded bg-[#465166] px-1.5 py-0.5 text-xs tabular-nums">
            {seller.rating.toFixed(2)}
            <Star size={13} className="fill-yellow-300 text-yellow-300" />
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate pr-5 text-sm font-semibold sm:text-base"
          title={seller.name}
        >
          {seller.name}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400">{labels.rank}:</span>
          <Trophy
            size={14}
            className={
              seller.tier === "Legendary" ? "text-cyan-200" : "text-yellow-300"
            }
          />
          <span className="font-semibold">{seller.tier}</span>
        </p>
        {!featured ? (
          <>
            <p className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
              {flags[seller.location] ? (
                <Image
                  src={`/${flags[seller.location]}.svg`}
                  alt=""
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px] rounded-full object-cover"
                />
              ) : (
                <span aria-hidden="true">🌐</span>
              )}
              <span className="truncate" title={seller.location}>
                {seller.location}
              </span>
            </p>
            <p className="mt-1.5 truncate text-[11px] text-slate-400">
              {format.format(seller.reviews)} {labels.reviews}
              <span className="mx-2 text-slate-500">·</span>
              {format.format(seller.sales)} {labels.sales}
            </p>
          </>
        ) : null}
      </div>
      {seller.verified ? (
        <ShieldCheck
          size={20}
          aria-label={labels.title}
          className="absolute top-3 right-3 fill-yellow-300 text-[#2d3544]"
        />
      ) : null}
      {featured ? (
        <span className="flex shrink-0 items-center gap-1 self-end pb-1 text-sm tabular-nums">
          {seller.rating.toFixed(2)}
          <Star size={14} className="fill-yellow-300 text-yellow-300" />
        </span>
      ) : null}
    </Link>
  );
}

export default function TrustedSellersClient({
  sellers,
}: {
  sellers: DirectorySeller[];
}) {
  const locale = useLocale();
  const labels = locale === "vi" ? copy.vi : copy.en;
  const format = new Intl.NumberFormat(locale);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [visibleCount, setVisibleCount] = useState(12);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const categories = [
    ...new Set(sellers.flatMap((seller) => seller.categories)),
  ].sort();
  const filtered = sellers
    .filter(
      (seller) =>
        seller.name
          .toLocaleLowerCase(locale)
          .includes(search.trim().toLocaleLowerCase(locale)) &&
        (!category || seller.categories.includes(category)),
    )
    .sort((a, b) =>
      sort === "rating"
        ? b.rating - a.rating || b.reviews - a.reviews
        : sort === "name"
          ? a.name.localeCompare(b.name, locale)
          : b.sales - a.sales,
    );
  const recommended = [...sellers].sort(
    (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  );
  const featuredPages = Math.ceil(recommended.length / 3);
  const featured = recommended.slice(featuredIndex * 3, featuredIndex * 3 + 3);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const displayed = filtered.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + visibleCount,
  );
  const resetPage = () => {
    setPage(1);
    setVisibleCount(pageSize);
  };
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setSort("popular");
    resetPage();
  };
  const controlClass =
    "h-[54px] w-full rounded-lg border border-transparent bg-[#2d3544] text-sm text-white outline-none focus-within:border-forest-500";

  return (
    <main
      id="main-content"
      className="w-full bg-[#181f29] px-4 pt-9 pb-20 text-white sm:px-8"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(24,31,41,.82), #181f29 900px), url('/seller-directory-bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
      }}
    >
      <div className="mx-auto w-full responsive">
        <header className="mb-8 text-center">
          <h1 className="text-[28px] font-semibold sm:text-[32px]">
            {labels.title}
          </h1>
          <p className="mt-3 text-sm leading-5 text-slate-400">
            {labels.intro}
            <br />
            {labels.subtitle}
          </p>
        </header>
        {sellers.length ? (
          <section
            aria-labelledby="recommended-heading"
            className="mb-[30px] rounded-lg bg-[#222a37]/95 px-4 pt-5 sm:px-5"
          >
            <h2
              id="recommended-heading"
              className="text-center text-base font-semibold uppercase"
            >
              {labels.recommended}
            </h2>
            {expanded ? (
              <div id="recommended-sellers" className="mt-5">
                <div className="grid auto-cols-[85%] grid-flow-col gap-3 overflow-x-auto pb-1 md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible">
                  {featured.map((seller) => (
                    <SellerCard
                      key={seller.id}
                      seller={seller}
                      featured
                      labels={labels}
                      format={format}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between gap-6">
                  <button
                    type="button"
                    aria-label={labels.previous}
                    disabled={featuredPages <= 1}
                    onClick={() =>
                      setFeaturedIndex(
                        (index) => (index - 1 + featuredPages) % featuredPages,
                      )
                    }
                    className="rounded-full bg-[#2d3544] p-2 hover:bg-slate-600 disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div
                    className="flex max-w-[70%] flex-1 gap-2"
                    aria-hidden="true"
                  >
                    {Array.from({ length: featuredPages }, (_, index) => (
                      <span
                        key={index}
                        className={`h-0.5 flex-1 ${index === featuredIndex ? "bg-forest-500" : "bg-[#2d3544]"}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label={labels.next}
                    disabled={featuredPages <= 1}
                    onClick={() =>
                      setFeaturedIndex((index) => (index + 1) % featuredPages)
                    }
                    className="rounded-full bg-[#2d3544] p-2 hover:bg-slate-600 disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : null}
            <button
              type="button"
              aria-label={labels.toggle}
              aria-expanded={expanded}
              aria-controls="recommended-sellers"
              onClick={() => setExpanded((value) => !value)}
              className="flex h-12 w-full items-center justify-center text-slate-400 hover:text-white"
            >
              <ChevronDown size={20} className={expanded ? "" : "rotate-180"} />
            </button>
          </section>
        ) : null}
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_54px] gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,.75fr)_54px]">
          <label
            className={`${controlClass} col-span-2 flex items-center gap-3 bg-[#222a37] px-4 lg:col-span-1`}
          >
            <Search size={22} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              aria-label={labels.search}
              placeholder={labels.search}
              className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>
          <label
            className={`${controlClass} relative col-span-2 flex items-center px-4 lg:col-span-1`}
          >
            <LayoutGrid
              size={20}
              className="pointer-events-none absolute left-4"
            />
            <select
              aria-label={labels.categories}
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                resetPage();
              }}
              className="h-full w-full appearance-none bg-transparent pr-7 pl-8 outline-none"
            >
              <option value="" className="bg-[#2d3544]">
                {labels.categories}
              </option>
              {categories.map((item) => (
                <option key={item} className="bg-[#2d3544]">
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 text-slate-400"
            />
          </label>
          <label className={`${controlClass} relative flex items-center px-4`}>
            <SlidersHorizontal
              size={20}
              className="pointer-events-none absolute left-4"
            />
            <select
              aria-label={labels.popular}
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                resetPage();
              }}
              className="h-full w-full appearance-none bg-transparent pr-7 pl-8 outline-none"
            >
              {(["popular", "rating", "name"] as const).map((value) => (
                <option key={value} value={value} className="bg-[#2d3544]">
                  {labels[value]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 text-slate-400"
            />
          </label>
          <button
            type="button"
            aria-label={labels.reset}
            onClick={resetFilters}
            className="flex h-[54px] items-center justify-center rounded-lg bg-[#222a37] text-slate-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>
        <p className="sr-only" role="status">
          {filtered.length} {locale === "vi" ? "người bán" : "sellers"}
        </p>
        {displayed.length ? (
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3">
            {displayed.map((seller) => (
              <SellerCard
                key={seller.id}
                seller={seller}
                labels={labels}
                format={format}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-[#222a37] px-4 py-16 text-center">
            <Search size={28} className="mx-auto mb-3 text-slate-400" />
            <h2 className="font-semibold">{labels.empty}</h2>
            <p className="mt-2 text-sm text-slate-400">{labels.hint}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 text-sm text-forest-500 hover:underline"
            >
              {labels.reset}
            </button>
          </div>
        )}
        {(page - 1) * pageSize + visibleCount < filtered.length ? (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + pageSize)}
            className="mt-[30px] flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#222a37] text-sm font-semibold uppercase hover:bg-[#2d3544]"
          >
            <RotateCcw size={21} />
            {labels.more}
          </button>
        ) : null}
        <div className="relative mt-[30px] flex flex-wrap items-center justify-center gap-5 sm:min-h-10 sm:px-32">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(value) => {
              setPage(value);
              setVisibleCount(pageSize);
            }}
          />
          <select
            aria-label={labels.size}
            value={pageSize}
            onChange={(event) => {
              const size = Number(event.target.value);
              setPageSize(size);
              setVisibleCount(size);
              setPage(1);
            }}
            className="h-10 w-[120px] rounded-lg bg-[#2d3544] px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-forest-500 sm:absolute sm:right-0"
          >
            {[12, 24, 48].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        {sellers.some((seller) => seller.sampleStats) ? (
          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            {labels.demo}
          </p>
        ) : null}
      </div>
    </main>
  );
}
