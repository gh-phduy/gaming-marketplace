"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import type { SellerProfile } from "./seller-profile.data";
import SellerProfileHeader from "./profile/SellerProfileHeader";
import SellerProfileTabs from "./profile/SellerProfileTabs";
import SellerStorePanel from "./profile/SellerStorePanel";
import SellerReviewsPanel from "./profile/SellerReviewsPanel";
import SellerFollowersPanel from "./profile/SellerFollowersPanel";
import SellerFollowingPanel from "./profile/SellerFollowingPanel";
import SellerChatPanel from "./profile/SellerChatPanel";
import { useTranslations } from "next-intl";

interface SellerProfileClientProps {
  profile: SellerProfile;
}

type TabKey = "store" | "reviews" | "followers" | "following";

const sellerFollowStorageKey = (sellerId: string) =>
  `difmark:seller-follow:${sellerId}`;

export default function SellerProfileClient({
  profile,
}: SellerProfileClientProps) {
  const t = useTranslations("user");
  const [activeTab, setActiveTab] = useState<TabKey>("store");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isFollowingSeller, setIsFollowingSeller] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(
      sellerFollowStorageKey(profile.id),
    );
    setIsFollowingSeller(storedValue === "true");
  }, [profile.id]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);

    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3200);
  };

  const handleToggleSellerFollow = () => {
    setIsFollowingSeller((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(
        sellerFollowStorageKey(profile.id),
        String(nextValue),
      );
      showToast(nextValue ? t("followUser") : t("unfollowUser"));
      return nextValue;
    });
  };

  return (
    <main
      id="main-content"
      className="w-full bg-midnight-950 px-3 pt-7 pb-16 text-white sm:px-4"
    >
      <div className="mx-auto w-full max-w-[1140px] space-y-6">
        <SellerProfileHeader
          profile={profile}
          isDescriptionOpen={isDescriptionOpen}
          isFollowing={isFollowingSeller}
          onToggleDescription={() => setIsDescriptionOpen((prev) => !prev)}
          onToggleFollow={handleToggleSellerFollow}
          onOpenChat={() => setIsChatOpen(true)}
          onNotify={showToast}
        />

        <SellerProfileTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        {activeTab === "store" ? (
          <SellerStorePanel profile={profile} />
        ) : null}
        {activeTab === "reviews" ? (
          <SellerReviewsPanel profile={profile} onNotify={showToast} />
        ) : null}
        {activeTab === "followers" ? (
          <SellerFollowersPanel profile={profile} onNotify={showToast} />
        ) : null}
        {activeTab === "following" ? (
          <SellerFollowingPanel profile={profile} onNotify={showToast} />
        ) : null}
      </div>

      <SellerChatPanel
        profile={profile}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNotify={showToast}
      />

      {toastMessage ? (
        <div className="fixed right-4 bottom-6 left-4 z-[70] mx-auto flex max-w-[600px] items-center justify-between rounded-lg border border-forest-100/20 bg-gradient-to-r from-forest-500/80 to-midnight-600 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur sm:left-1/2 sm:-translate-x-1/2">
          <span className="inline-flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-500 text-midnight-950">
              <Check className="h-4 w-4" />
            </span>
            {toastMessage}
          </span>
          <button
            type="button"
            className="text-steel-300 transition hover:text-white"
            onClick={() => setToastMessage(null)}
            aria-label={t("dismissNotification")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </main>
  );
}
