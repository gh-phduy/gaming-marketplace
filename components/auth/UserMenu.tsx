"use client";

import { useState, useEffect } from "react";
import AccountAvatar from "./AccountAvatar";
import { Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserMenuHeader } from "./userMenu/UserMenuHeader";
import { UserMenuContent } from "./userMenu/UserMenuContent";
import { UserMenuFooter } from "./userMenu/UserMenuFooter";
import { LanguageCurrencySelector } from "./userMenu/LanguageCurrencySelector";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    picture: string;
  };
}

/* ==========================================================================
   MAIN COMPONENT: UserMenu Sidebar Sheet
   ========================================================================== */

/**
 * UserMenu Component
 *
 * Renders the authenticated user's profile dropdown drawer (Sheet).
 * Syncs workspace locale settings and routes logout actions.
 */
export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const {
    language: selectedLang,
    setLanguage: setSelectedLang,
    currency: selectedCurrency,
    setCurrency: setSelectedCurrency,
  } = useSettings();
  const { logout } = useAuth();
  const t = useTranslations("userMenu");

  useEffect(() => {
    const msg = sessionStorage.getItem("auth_success_toast");
    if (msg) {
      setToastMessage(msg);
      sessionStorage.removeItem("auth_success_toast");
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.setItem("auth_success_toast", "Logged out successfully!");
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {/* Drawer Trigger Button (User Avatar) */}
        <SheetTrigger
          aria-label={user.name}
          title={user.name}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-state-focus focus-visible:outline-none"
        >
          <AccountAvatar src={user.picture} name={user.name} />
        </SheetTrigger>

        {/* Sidebar Content Panel */}
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-[316px] gap-0 overflow-visible border-l border-white/10 p-0 shadow-2xl backdrop-blur-sm sm:max-w-[316px]"
        >
          <div className="relative flex h-full w-full flex-col bg-midnight-700/80">
            {/* Header Section (Profile Details & Setting Selectors) */}
            <div className="bg-midnight-600/60 px-5 pt-8 pb-3">
              <UserMenuHeader user={user} buyerRankText={t("buyerRank")} />

              {/* Language & Currency Selectors dropdowns */}
              <LanguageCurrencySelector
                selectedLang={selectedLang}
                onLanguageChange={setSelectedLang}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
            </div>

            {/* Core Navigation Links Menu */}
            <UserMenuContent t={t} onNavigate={() => setIsOpen(false)} />

            {/* Footer Action Bar */}
            <UserMenuFooter onLogout={handleLogout} logoutText={t("logout")} />
          </div>
        </SheetContent>
      </Sheet>

      {toastMessage && (
        <div className="animate-in fade-in slide-in-from-top-4 fixed top-6 left-1/2 z-[999] flex w-[calc(100%-2rem)] max-w-[360px] -translate-x-1/2 items-center justify-between gap-3 rounded-xl border border-[#46ca43]/30 bg-[#161b26]/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md duration-300 sm:right-6 sm:left-auto sm:w-80 sm:translate-x-0">
          <span className="inline-flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#46ca43]/20 text-[#46ca43]">
              <Check className="h-4 w-4" />
            </span>
            <span className="font-medium text-gray-200">{toastMessage}</span>
          </span>
          <button
            type="button"
            className="text-gray-400 transition-colors hover:text-white"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
