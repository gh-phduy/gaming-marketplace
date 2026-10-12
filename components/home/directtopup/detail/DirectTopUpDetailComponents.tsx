"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  CircleDollarSign,
  Globe2,
  Info,
  List,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";
import {
  TOPUP_FAQS,
  TOPUP_SIDEBAR_GAMES,
  type TopUpGameDetail,
  type TopUpPackage,
} from "./topup-detail-data";

export function formatMoney(value: number) {
  return `$ ${value.toFixed(2)}`;
}

export function TopUpInput({ field, value, onChange }: { field: TopUpGameDetail["inputs"][number]; value: string; onChange: (value: string) => void }) {
  const Icon = field.icon === "globe" ? Globe2 : User;

  return (
    <label className="flex h-14 items-center gap-4 rounded-lg bg-midnight-650 px-5 text-dm-text-secondary">
      <Icon className="size-5 shrink-0" aria-hidden />
      <span className="sr-only">{field.label}</span>
      <input
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        maxLength={100}
        required
        placeholder={field.placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-dm-text-secondary"
      />
      <Info className="size-4 shrink-0" aria-hidden />
    </label>
  );
}

export function PackageVisual({
  game,
  item,
}: {
  game: TopUpGameDetail;
  item: TopUpPackage;
}) {
  const isDiamonds = game.packageTheme === "diamonds";
  const isCrystals = game.packageTheme === "crystals";
  const visualText =
    game.packageTheme === "uc"
      ? "UC"
      : isDiamonds
        ? "DIA"
        : isCrystals
          ? "CR"
          : "COIN";

  return (
    <div
      className={cn(
        "relative flex h-[118px] items-center justify-center overflow-hidden rounded-t-lg",
        isDiamonds && "bg-[linear-gradient(135deg,#503bea,#62d4e6)]",
        isCrystals && "bg-[linear-gradient(135deg,#354fd8,#a76cf7)]",
        game.packageTheme === "coins" &&
          "bg-[linear-gradient(135deg,#3d465d,#a67c35)]",
        game.packageTheme === "uc" &&
          "bg-[linear-gradient(135deg,#44301f,#74583d)]",
      )}
    >
      <Image
        src={game.iconImage}
        alt=""
        fill
        sizes="180px"
        className="object-cover opacity-20"
      />
      <div
        className={cn(
          "relative flex size-20 items-center justify-center rounded-2xl border border-white/20 shadow-2xl",
          isDiamonds && "bg-cyan-300/40",
          isCrystals && "bg-violet-200/35",
          game.packageTheme === "coins" && "bg-amber-200/25",
          game.packageTheme === "uc" && "bg-amber-200/20",
        )}
      >
        <span
          className={cn(
            "text-center text-base leading-none font-black tracking-wide",
            isDiamonds && "text-cyan-50",
            isCrystals && "text-violet-50",
            game.packageTheme === "coins" && "text-amber-100",
            game.packageTheme === "uc" && "text-amber-100",
          )}
        >
          {visualText}
        </span>
      </div>
      <div
        aria-hidden
        className={cn(
          "absolute right-4 bottom-4 left-4 h-3 rounded-full blur-md",
          isDiamonds && "bg-cyan-200/55",
          isCrystals && "bg-violet-200/50",
          (game.packageTheme === "coins" || game.packageTheme === "uc") &&
            "bg-amber-200/35",
        )}
      />
      <span className="sr-only">{item.label}</span>
    </div>
  );
}

export function PackageCard({
  game,
  item,
  selected,
  onSelect,
}: {
  game: TopUpGameDetail;
  item: TopUpPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "overflow-hidden rounded-lg bg-midnight-700 text-left transition focus-visible:ring-2 focus-visible:ring-dm-accent-green focus-visible:outline-none",
        selected
          ? "ring-1 ring-dm-accent-green"
          : "hover:-translate-y-0.5 hover:bg-midnight-650",
      )}
    >
      <PackageVisual game={game} item={item} />
      <div
        className={cn(
          "flex h-8 items-center justify-center px-3 text-center text-sm font-bold text-white",
          game.packageTheme === "diamonds" && "bg-cyan-400/75",
          game.packageTheme === "crystals" && "bg-violet-400/75",
          game.packageTheme === "coins" && "bg-[#766647]",
          game.packageTheme === "uc" && "bg-[#79624d]",
        )}
      >
        <span className="truncate">{item.label}</span>
      </div>
      <div className="flex h-10 items-center justify-center text-sm font-medium text-white">
        {formatMoney(item.price)}
      </div>
    </button>
  );
}

export function Sidebar({ activeSlug }: { activeSlug: string }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  
  const filteredGames = useMemo(() => {
    if (!normalizedQuery) return TOPUP_SIDEBAR_GAMES;

    return TOPUP_SIDEBAR_GAMES.filter((game) =>
      game.name.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  return (
    <aside className="flex max-h-[360px] max-w-full min-w-0 flex-col overflow-hidden rounded-xl bg-midnight-800 p-4 xl:sticky xl:top-0 xl:max-h-[calc(100vh-128px)]">
      <label className="flex h-11 shrink-0 items-center gap-3 rounded-lg bg-midnight-700 px-4 text-dm-text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_12px_24px_rgba(4,9,16,0.24)]">
        <Search className="size-5 shrink-0" aria-hidden />
        <span className="sr-only">Find product</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find Product"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-dm-text-secondary"
        />
      </label>

      <div className="mt-5 min-h-0 max-h-[280px] space-y-1 overflow-y-auto pr-1 [scrollbar-color:#46536a_transparent] [scrollbar-width:thin] xl:max-h-[680px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#46536a] [&::-webkit-scrollbar-track]:bg-transparent">
        {filteredGames.map((game) => {
          const isActive = activeSlug === game.slug;
          const content = (
            <>
              <span className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={game.image}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>
              <span className="truncate text-sm font-bold">{game.name}</span>
            </>
          );

          if (!game.isEnabled) {
            return (
              <div
                key={game.slug}
                aria-disabled="true"
                className="flex h-14 items-center gap-3 rounded-lg bg-midnight-750 px-2 py-2 text-white/90"
              >
                {content}
              </div>
            );
          }

          const categoryPath =
            game.category === "services" ? "services" : `${game.category}-games`;

          return (
            <Link
              key={game.slug}
              href={`/direct-top-up/${categoryPath}/${game.slug}`}
              className={cn(
                "flex h-14 items-center gap-3 rounded-lg px-2 text-white transition hover:bg-midnight-650",
                isActive ? "bg-midnight-600" : "bg-midnight-750",
              )}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export function GameHero({ game, fields, onFieldChange, error }: { game: TopUpGameDetail; fields: Record<string, string>; onFieldChange: (id: string, value: string) => void; error: string | null }) {
  return (
    <section className="w-full max-w-full overflow-hidden rounded-xl bg-midnight-800">
      <div className="relative min-h-[170px] overflow-hidden">
        <Image
          src={game.heroImage}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 780px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-midnight-800 to-transparent" />
        <div className="relative flex min-h-[170px] flex-col justify-end gap-5 p-5">
          <div className="relative size-[70px] overflow-hidden rounded-xl shadow-xl">
            <Image
              src={game.iconImage}
              alt={`${game.title} icon`}
              fill
              sizes="70px"
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">{game.title}</h1>
        </div>
      </div>

      <div className="space-y-5 p-5 pt-4">
        <p className="text-sm leading-6 text-dm-text-secondary">
          {game.description}
        </p>
        {game.inputs.map((field) => (
          <TopUpInput key={field.id} field={field} value={fields[field.id] ?? ""} onChange={value => onFieldChange(field.id, value)} />
        ))}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button
          type="button"
          className="flex h-14 w-full items-center justify-between rounded-lg bg-midnight-650 px-5 text-left text-white"
        >
          <span className="flex items-center gap-4">
            <Globe2 className="size-5 text-dm-text-secondary" aria-hidden />
            <span>{game.regionLabel}</span>
          </span>
          {game.isRegionSelectable ? (
            <ChevronDown className="size-5" aria-hidden />
          ) : null}
        </button>
      </div>
    </section>
  );
}

export function PackageGrid({
  game,
  selectedPackageId,
  onSelect,
}: {
  game: TopUpGameDetail;
  selectedPackageId: string;
  onSelect: (item: TopUpPackage) => void;
}) {
  return (
    <section className="w-full max-w-full rounded-xl bg-midnight-800 p-5">
      <h2 className="text-lg font-bold text-white">{game.productGroupTitle}</h2>

      <div className="mt-5 flex gap-5">
        <button
          type="button"
          className="flex h-12 min-w-0 flex-1 items-center justify-between rounded-lg bg-midnight-700 px-4 text-left text-dm-text-secondary"
        >
          <span className="flex items-center gap-3">
            <SlidersHorizontal className="size-5" aria-hidden />
            <span>
              Price: <span className="text-white">Low Price</span>
            </span>
          </span>
          <ChevronDown className="size-5 text-white" aria-hidden />
        </button>
        <button
          type="button"
          className="hidden h-12 items-center gap-3 rounded-lg bg-midnight-700 px-5 text-dm-text-secondary sm:flex"
        >
          <List className="size-5" aria-hidden />
          List
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
        {game.packages.map((item) => (
          <PackageCard
            key={item.id}
            game={game}
            item={item}
            selected={item.id === selectedPackageId}
            onSelect={() => onSelect(item)}
          />
        ))}
      </div>
    </section>
  );
}

export function CartSummary({
  game,
  selectedPackage,
  onCheckout,
}: {
  game: TopUpGameDetail;
  selectedPackage: TopUpPackage;
  onCheckout: () => void;
}) {
  const cashback = selectedPackage.price * 0.03;

  return (
    <aside className="max-w-full min-w-0 rounded-xl bg-midnight-800 p-4 xl:sticky xl:top-0">
      <h2 className="text-lg font-bold text-white">Cart total</h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4 text-dm-text-secondary">
          <dt>Discount:</dt>
          <dd className="font-bold text-white">$ 0.00</dd>
        </div>
        <div className="flex justify-between gap-4 text-dm-text-secondary">
          <dt>Difmark balance pay:</dt>
          <dd className="font-bold text-white">$ 0.00</dd>
        </div>
        <div className="flex justify-between gap-4 text-dm-text-secondary">
          <dt>Payment method fee:</dt>
          <dd className="font-bold text-white">$ 0.00</dd>
        </div>
        <div className="flex justify-between gap-4 text-dm-accent-green">
          <dt className="flex items-center gap-1">
            <CircleDollarSign className="size-4" aria-hidden />
            Cashback:
          </dt>
          <dd className="font-bold">{formatMoney(cashback)}</dd>
        </div>
      </dl>

      <div className="mt-7 flex justify-between gap-4 text-sm">
        <span className="text-dm-text-secondary">Total:</span>
        <span className="font-bold text-white">
          {formatMoney(selectedPackage.price)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5">
        <button
          type="button"
          className="flex h-10 items-center justify-center gap-1 rounded-lg bg-white text-sm font-semibold text-black"
          aria-label={`Pay for ${game.title} with Google Pay`}
        >
          <FcGoogle className="size-5" aria-hidden />
          Pay
        </button>
        <button
          type="button"
          className="flex h-10 items-center justify-center gap-1 rounded-lg bg-white text-sm font-semibold text-black"
          aria-label={`Pay for ${game.title} with Apple Pay`}
        >
          <FaApple className="size-4" aria-hidden />
          Pay
        </button>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-5 h-[54px] w-full rounded-lg bg-[#95a3b7] text-sm font-bold text-white transition hover:bg-[#a5b2c4] focus-visible:ring-2 focus-visible:ring-dm-accent-green focus-visible:outline-none"
      >
        GO TO CHECKOUT
      </button>
    </aside>
  );
}

export function FaqList() {
  return (
    <section className="mt-12">
      <h2 className="text-lg font-bold text-white">Direct top ups FAQ</h2>
      <div className="mt-5 space-y-1.5">
        {TOPUP_FAQS.map((question) => (
          <details key={question} className="group rounded bg-midnight-800">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-base font-bold text-white">
              {question}
              <ChevronDown
                className="size-5 shrink-0 transition group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="px-5 pb-5 text-sm leading-6 text-dm-text-secondary">
              Direct Top Up orders are delivered to the game account details you
              enter. Please double-check IDs and region before checkout.
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
