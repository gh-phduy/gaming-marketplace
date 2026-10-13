"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IoGameController } from "react-icons/io5";
import { GiTwoCoins } from "react-icons/gi";
import type { HeroTab } from "./types";

interface HeroTabsProps {
  activeTab: HeroTab;
}

/**
 * Switcher between Digital and Direct Top Up hero contexts.
 * Start the indicator movement immediately while the router loads the next tab.
 */
export function HeroTabs({ activeTab }: HeroTabsProps) {
  // Start the pill transition on navigation, then reconcile with the committed route.
  const [selectedTab, setSelectedTab] = useState(activeTab);
  useEffect(() => setSelectedTab(activeTab), [activeTab]);
  const isDigital = selectedTab === "digital";

  return (
    <div className="mb-8 flex justify-center">
      <div className="relative flex w-1/2 gap-1 rounded-full bg-white/10 p-1.5 backdrop-blur-md max-[600px]:w-5/6 max-[600px]:min-w-0 min-[601px]:min-w-[460px]">
        {/* One shared green pill slides between the two links. */}
        <div
          className="pointer-events-none absolute top-1.5 left-1.5 h-[calc(100%-12px)] w-[calc((100%-16px)/2)] rounded-full shadow-[0_2px_14px_rgba(85,153,60,0.24)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: isDigital
              ? "translateX(0)"
              : "translateX(calc(100% + 4px))",
            backgroundImage:
              "linear-gradient(115deg, #71b94f 0%, #529339 55%, #3d772f 100%)",
          }}
          aria-hidden="true"
        />

        <Link
          href="/"
          scroll={false}
          onNavigate={() => setSelectedTab("digital")}
          aria-current={activeTab === "digital" ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-11 w-1/2 cursor-pointer items-center justify-center gap-1 rounded-full px-2 text-sm font-semibold text-white transition-colors duration-300 sm:h-[50px] sm:gap-2 sm:text-base md:text-lg",
            isDigital ? "" : "text-white/60 hover:text-white",
          )}
        >
          <span
            style={{ transform: `scale(${isDigital ? 1.2 : 1})` }}
            className="flex items-center transition-transform duration-500"
          >
            <IoGameController className="text-lg sm:text-xl md:text-2xl" />
          </span>
          Digital Products
        </Link>

        <Link
          href="/direct-top-up"
          scroll={false}
          onNavigate={() => setSelectedTab("topup")}
          aria-current={activeTab === "topup" ? "page" : undefined}
          className={cn(
            "relative z-10 flex h-11 w-1/2 cursor-pointer items-center justify-center gap-1 rounded-full px-2 text-sm font-semibold text-white transition-colors duration-300 sm:h-[50px] sm:gap-2 sm:text-base md:text-lg",
            !isDigital ? "" : "text-white/60 hover:text-white",
          )}
        >
          <span
            style={{ transform: `scale(${isDigital ? 1 : 1.2})` }}
            className="flex items-center transition-transform duration-500"
          >
            <GiTwoCoins className="text-lg sm:text-xl md:text-2xl" />
          </span>
          Direct Top Up
        </Link>
      </div>
    </div>
  );
}
