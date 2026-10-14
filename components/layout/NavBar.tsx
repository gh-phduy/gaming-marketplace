"use client";

import { Link, usePathname } from "@/i18n/routing";
import Image from "next/image";
import logoImage from "@/public/Difmark-logo.png";
import { ROUTES } from "@/lib/constants";
import CheckoutNavSection from "./nav/CheckoutNavSection";
import MainNavSection from "./nav/MainNavSection";

/* ============================================
   MAIN COMPONENT 
   ============================================ */

/**
 * NavBar Component
 *
 * Main navigation bar with:
 * - Responsive design
 * - Scroll-based background change
 * - Categories dropdown
 * - Search input
 * - Cart and sign-in actions
 *
 * @example
 * <NavBar />
 */
export default function NavBar() {
  const pathname = usePathname();
  const isCheckoutPage = pathname?.startsWith("/checkout");
  const isProductPage = pathname?.startsWith("/product");

  return (
    <nav
      className="fixed top-0 right-0 left-0 z-50 flex w-full justify-center transition-all duration-1000"
      role="navigation"
      aria-label={isCheckoutPage ? "Checkout navigation" : "Main navigation"}
    >
      {/* Main Container */}
      <div
        className={`flex w-full translate-y-0 justify-center gap-x-3 bg-brand/80 shadow-2xl backdrop-blur-xl transition-all duration-700 ease-out`}
      >
        <div
          className={`flex h-16 w-full items-center justify-between gap-x-4 px-4 770:justify-center 800:gap-x-6 800:px-8 ${isProductPage ? "md:px-12" : "responsive-nav"}`}
        >
          {/* Logo - Hide on mobile during checkout to save space */}
          <Link
            href={ROUTES.HOME}
            className={`relative block h-[30px] w-[130px] shrink-0 ${isCheckoutPage ? "hidden md:block" : ""}`}
          >
            <Image
              src={logoImage.src}
              alt="Difmark - Digital Game Marketplace"
              fill
              sizes="130px"
              className="object-contain"
            />
          </Link>

          {isCheckoutPage ? <CheckoutNavSection /> : <MainNavSection />}
        </div>
      </div>
    </nav>
  );
}
