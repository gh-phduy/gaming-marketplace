"use client";

import {
  MdSpaceDashboard,
  MdShoppingBag,
  MdAccountBalanceWallet,
  MdCardGiftcard,
  MdPerson,
  MdBookmark,
  MdVerified,
  MdContactSupport,
  MdBugReport,
  MdStorefront,
} from "react-icons/md";
import { FaTicketAlt, FaHandHoldingUsd } from "react-icons/fa";
import { MenuItem, MenuSection } from "./MenuComponents";
import { useRouter } from "@/i18n/routing";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

interface UserMenuContentProps {
  t: (key: string) => string;
  onNavigate?: () => void;
}

/* ==========================================================================
   MAIN COMPONENT: UserMenuContent Links List
   ========================================================================== */

/**
 * UserMenuContent Component
 *
 * Renders the categorized menu sections list inside the user profile drawer sidebar.
 * Composes list groups for Dashboard, Finances, Support Tickets, and Settings.
 */
export function UserMenuContent({ t, onNavigate }: UserMenuContentProps) {
  const router = useRouter();
  // Reusable page redirection handler
  const navigateTo = (href: string) => {
    onNavigate?.();
    router.push(href);
  };

  return (
    <div className="custom-scrollbar flex-1 overflow-y-auto px-5">
      {/* Group 1: Main Platform Dashboards */}
      <MenuSection title={t("mainSection")}>
        <MenuItem
          icon={<MdSpaceDashboard />}
          label={t("dashboard")}
          onClick={() => navigateTo("/account/dashboard")}
        />
        <MenuItem
          icon={<MdStorefront />}
          label="Seller dashboard"
          onClick={() => navigateTo("/account/dashboard#seller-workspace")}
        />
        <MenuItem icon={<MdShoppingBag />} label={t("myOrders")}
          onClick={() => navigateTo("/account/dashboard#dashboard-recent-orders")} />
      </MenuSection>

      {/* Group 2: User Wallet, Rewards & Balance info */}
      <MenuSection title={t("financesSection")}>
        <MenuItem
          icon={<MdAccountBalanceWallet />}
          label={t("wallet")}
          value="$ 0.00"
          valueBadge
          expandable
        />
        <MenuItem
          icon={<MdCardGiftcard />}
          label={t("cashback")}
          value="€ 0.00"
          valueBadge
          valueClassName="text-[#4ade80]"
        />
        <MenuItem icon={<FaHandHoldingUsd />} label={t("affiliateProgram")} />
      </MenuSection>

      {/* Group 3: Help center support tickets */}
      <MenuSection title={t("casesSection")}>
        <MenuItem icon={<FaTicketAlt />} label={t("myTickets")} />
      </MenuSection>

      {/* Group 4: Account settings profile settings */}
      <MenuSection title={t("generalSection")} noDivider>
        <MenuItem icon={<MdPerson />} label={t("accountSettings")} expandable />
        <MenuItem icon={<MdBookmark />} label={t("bookmarks")} />
        <MenuItem icon={<MdVerified />} label={t("verification")} expandable />
        <MenuItem icon={<MdContactSupport />} label={t("contactUs")} />
        <MenuItem icon={<MdBugReport />} label={t("bugReport")} />
      </MenuSection>
    </div>
  );
}

