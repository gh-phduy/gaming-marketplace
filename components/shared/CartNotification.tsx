"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, Trash2, X } from "lucide-react";

export interface CartNotice {
  type: "added" | "removed";
  name: string;
}

interface CartNotificationProps {
  notification: CartNotice | null;
  onDismiss: () => void;
}

export default function CartNotification({
  notification,
  onDismiss,
}: CartNotificationProps) {
  const t = useTranslations("user");
  const removed = notification?.type === "removed";

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <div className="pointer-events-none fixed top-20 right-3 left-3 z-[100] flex justify-end sm:left-auto sm:w-[360px]">
      <div
        className={
          notification
            ? "pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-[#202a35] p-4 text-white shadow-xl " +
              (removed ? "border-[#f6c65b]/40" : "border-[#63c54c]/40")
            : undefined
        }
      >
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          {notification && (
            <>
              {removed ? (
                <Trash2
                  size={22}
                  className="mt-0.5 shrink-0 text-[#f6c65b]"
                  aria-hidden="true"
                />
              ) : (
                <CircleCheck
                  size={22}
                  className="mt-0.5 shrink-0 text-[#63c54c]"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {t(removed ? "productRemovedFromCart" : "productAddedToCart")}
                </p>
                <p className="mt-1 text-xs leading-5 break-words text-dm-text-secondary">
                  {notification.name}
                </p>
              </div>
            </>
          )}
        </div>
        {notification && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("dismissNotification")}
            className="-mt-2 -mr-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-dm-text-secondary hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[#63c54c]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
