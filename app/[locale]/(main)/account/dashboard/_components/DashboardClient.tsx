"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserDashboardProfile } from "../_lib/dashboard.data";
import { getBuyerOrders } from "@/lib/buyer-orders";
import DashboardVerificationBanner from "./VerificationBanner";
import DashboardWalletSection from "./WalletSection";
import DashboardRecentOrders from "./RecentOrders";
import DashboardSecurityCard from "./SecurityCard";
import DashboardSellerWorkspace from "./DashboardSellerWorkspace";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { LANGUAGES, CURRENCIES } from "@/components/auth/userMenu/constants";
import { normalizeSellerRouteKey } from "@/components/user/seller-profile.route";

// Import modular presentational components
import { DashboardProfileCard } from "./DashboardProfileCard";
import { DashboardTimeBar } from "./DashboardTimeBar";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

interface DashboardClientProps {
  profile: UserDashboardProfile;
}

/* ==========================================================================
   MAIN COMPONENT: DashboardClient
   ========================================================================== */

/**
 * DashboardClient Component
 *
 * Serves as the high-level layout coordinator for the authenticated user dashboard.
 * Embeds verification notices, profile summary charts, timezone indicators,
 * seller workspace tabs, wallet sections, and order histories.
 */
export default function DashboardClient({ profile }: DashboardClientProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { language: currentLangCode, currency: currentCurrencyCode } =
    useSettings();
  const [orderHistory, setOrderHistory] = useState<{
    buyerId: string;
    orders: UserDashboardProfile["recentOrders"];
    error?: string;
  }>();
  useEffect(() => {
    if (!user?.id) return;
    const buyerId = user.id;
    // Ignore a late response after logout, account switching or unmounting.
    let active = true;
    void getBuyerOrders(buyerId).then(
      (orders) => {
        if (active) setOrderHistory({ buyerId, orders });
      },
      (error) => {
        if (active)
          setOrderHistory({ buyerId, orders: [], error: error.message });
      },
    );
    return () => {
      active = false;
    };
  }, [user?.id]);
  // Hide the previous account's results while the next account is loading.
  const currentOrders =
    orderHistory?.buyerId === user?.id ? orderHistory : undefined;

  // Redirect to home if user session is not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // Memoized aggregator to map workspace profile state from auth contexts
  const accountProfile = useMemo<UserDashboardProfile>(() => {
    const emailName = user?.email?.split("@")[0];
    const username = user?.name || emailName || profile.username || "Guest";
    const avatarUrl = user?.picture || profile.avatarUrl || "/avt1.png";

    const langObj = LANGUAGES.find((l) => l.code === currentLangCode);
    const currObj = CURRENCIES.find((c) => c.code === currentCurrencyCode);

    // Map currency flagCode from the currency code namespace
    const currencyFlagCode =
      currentCurrencyCode === "EUR"
        ? "EU"
        : currentCurrencyCode === "GBP"
          ? "GB"
          : currentCurrencyCode === "JPY"
            ? "JP"
            : "US";

    return {
      ...profile,
      id: user?.id || user?.email || profile.id || "guest",
      username,
      avatarUrl,
      language: {
        name: langObj?.name || profile.language.name || "English",
        flagCode: currentLangCode || "EN",
      },
      currency: {
        name: currObj?.name || profile.currency.name || "US Dollar",
        code: currentCurrencyCode || "USD",
        symbol: currObj?.symbol || profile.currency.symbol || "$",
        flagCode: currencyFlagCode,
      },
      spent: {
        ...profile.spent,
        currencySymbol: currObj?.symbol || profile.spent.currencySymbol || "$",
      },
      wallet: {
        ...profile.wallet,
        currencySymbol: currObj?.symbol || profile.wallet.currencySymbol || "$",
      },
      recentOrders: profile.recentOrders || [],
    };
  }, [profile, user, currentLangCode, currentCurrencyCode]);

  // Sync public profile attributes to localStorage configurations
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    window.localStorage.setItem(
      `difmark_public_seller_profiles:${normalizeSellerRouteKey(
        accountProfile.username,
      )}`,
      JSON.stringify({
        id: accountProfile.id,
        name: accountProfile.username,
        avatar: accountProfile.avatarUrl,
        memberSince: accountProfile.memberSince,
        location: accountProfile.location.flagCode,
        language: accountProfile.language.flagCode,
      }),
    );
  }, [accountProfile, user]);

  // Render blank shell during loader states
  if (isLoading || !user) {
    return null;
  }

  return (
    <main
      id="main-content"
      className="w-full bg-midnight-950 px-3 pt-4 pb-16 text-white sm:px-4"
    >
      <div className="mx-auto w-full max-w-[1140px] space-y-4">
        {/* Verification Alert Banner */}
        <DashboardVerificationBanner />

        {/* User Summary profile block */}
        <DashboardProfileCard accountProfile={accountProfile} />

        {/* Local time & Exchange Rate Bar */}
        <DashboardTimeBar />

        {/* Seller tab-workspace panel */}
        <DashboardSellerWorkspace profile={accountProfile} />

        {/* Wallet Balance section */}
        <DashboardWalletSection
          wallet={accountProfile.wallet}
          currency={accountProfile.currency}
        />

        {/* Recent Transaction Orders & Security logs */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardRecentOrders
              orders={currentOrders?.orders ?? []}
              loading={!currentOrders}
              error={currentOrders?.error}
            />
          </div>
          <DashboardSecurityCard isVerified={accountProfile.isVerified} />
        </div>
      </div>
    </main>
  );
}
