"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { CreditCard, ShoppingCart, CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { getCheckoutProgress, useCheckoutPaymentStatus } from "./CheckoutPaymentStatus";

/* ==========================================================================
   MAIN COMPONENT: CheckoutNavBar
   ========================================================================== */

/**
 * CheckoutNavBar Component
 *
 * Renders the top progress bar for checkout flows.
 * Uses the server-verified result and url path patterns to determine if the payment
 * is completed, failed, or processing, updating progress bars and steps.
 */
export default function CheckoutNavBar() {
  const t = useTranslations("checkout");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { result } = useCheckoutPaymentStatus();
  const { isCompleted, isFailed } = getCheckoutProgress(pathname, searchParams.get("payment_intent"), result);
  const isAfterCheckout = isCompleted || isFailed;

  // Active step styling classes based on checkout state
  const checkoutStepClass = isAfterCheckout ? "text-[#46ca43]" : "text-white";
  const checkoutIconClass = isAfterCheckout
    ? "border-[#46ca43] bg-[#46ca43] text-black"
    : "border-[#58a6ff] bg-[#374050] text-white";

  // Label configuration for the final checkout status indicator
  const lastStepLabel = isCompleted
    ? t("completed")
    : isFailed
      ? t("failed")
      : t("processing");
  const lastStepClass = isCompleted
    ? "text-[#46ca43]"
    : isFailed
      ? "text-[#f85149]"
      : "text-[#8b949e]";

  return (
    <nav className="sticky top-0 z-50 flex h-20 w-full items-center justify-center border-b border-[#2d3544] bg-[#161b22]">
      <div className="flex w-full max-w-[1622px] items-center justify-between px-4">
        {/* Brand Logo Link */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-[40px] w-[150px]">
            <Image
              src="/Difmark-logo.png"
              alt={t("difmarkLogo")}
              width={150}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Progress Tracker Steps (compact on mobile) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm font-medium md:static md:translate-x-0 md:gap-4">
          {/* Step 1: Shopping Cart */}
          <div className="flex items-center gap-1.5 md:gap-2 text-[#46ca43]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#46ca43] text-black">
              <ShoppingCart className="h-3.5 w-3.5" />
            </div>
            <span className="hidden md:inline">{t("shoppingCart")}</span>
          </div>

          <div className="h-[2px] w-6 md:w-24 bg-[#46ca43]"></div>

          {/* Step 2: Checkout */}
          <div className={`flex items-center gap-1.5 md:gap-2 ${checkoutStepClass}`}>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${checkoutIconClass}`}
            >
              <CreditCard className="h-3.5 w-3.5" />
            </div>
            <span className="hidden md:inline">{t("checkout")}</span>
          </div>

          <div
            className={`h-[2px] w-6 md:w-24 ${isCompleted ? "bg-[#46ca43]" : isFailed ? "bg-[#f85149]" : "bg-[#2d3544]"}`}
          ></div>

          {/* Step 3: Status */}
          <div className={`flex items-center gap-1.5 md:gap-2 ${lastStepClass}`}>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${isCompleted ? "bg-[#46ca43] text-black" : isFailed ? "bg-[#f85149] text-white" : "bg-[#21262d]"}`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : isFailed ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-[#8b949e]"></div>
              )}
            </div>
            <span className="hidden md:inline">{lastStepLabel}</span>
          </div>
        </div>

        {/* Currency & Language Indicators */}
        <div className="hidden items-center gap-4 text-sm text-[#8b949e] sm:flex">
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-white">USD</span>
            <span className="cursor-pointer hover:text-white">LNG</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

