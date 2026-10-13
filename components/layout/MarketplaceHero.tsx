"use client";

import { usePathname } from "@/i18n/routing";
import { HeroCarousel } from "@/components/home/HeroCarousel";

// Keep the same Hero mounted between the two tabs so CSS transitions and
// carousel state survive navigation. Detail and account routes have no Hero.
export default function MarketplaceHero() {
  const pathname = usePathname();
  if (pathname !== "/" && pathname !== "/direct-top-up") return null;

  return (
    <HeroCarousel
      activeTab={pathname === "/direct-top-up" ? "topup" : "digital"}
    />
  );
}
