"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Bell,
  CheckCircle2,
  Clock3,
  type LucideIcon,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  ShieldCheck,
  Tag,
} from "lucide-react";
import {
  formatNotificationTime,
  markAllMarketplaceNotificationsRead,
  markMarketplaceNotificationRead,
  readMarketplaceNotifications,
  subscribeMarketplaceNotifications,
  type MarketplaceNotification,
  type MarketplaceNotificationKind,
} from "@/components/notifications/notification-store";

type NotificationFilter = "all" | "unread";

const notificationPresentation: Record<
  MarketplaceNotificationKind,
  { icon: LucideIcon; iconBg: string; iconColor: string; rail: string }
> = {
  payment: {
    icon: CheckCircle2,
    iconBg: "bg-[#1a3a2a]",
    iconColor: "text-[#4ade80]",
    rail: "bg-[#4ade80]",
  },
  delivery: {
    icon: PackageCheck,
    iconBg: "bg-[#1a2a3a]",
    iconColor: "text-[#58a6ff]",
    rail: "bg-[#58a6ff]",
  },
  message: {
    icon: MessageCircle,
    iconBg: "bg-[#1e2630]",
    iconColor: "text-[#8b9bb4]",
    rail: "bg-[#8b9bb4]",
  },
  price: {
    icon: Tag,
    iconBg: "bg-[#2a2a1a]",
    iconColor: "text-[#eac54f]",
    rail: "bg-[#eac54f]",
  },
  security: {
    icon: ShieldCheck,
    iconBg: "bg-[#1a3a2a]",
    iconColor: "text-[#4ade80]",
    rail: "bg-[#4ade80]",
  },
};

function NotificationRow({
  notification,
  onSelect,
}: {
  notification: MarketplaceNotification;
  onSelect: (notification: MarketplaceNotification) => void;
}) {
  const presentation =
    notificationPresentation[notification.kind] ??
    notificationPresentation.message;
  const Icon = presentation.icon;
  const isUnread = !notification.readAt;

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={`group relative flex w-full items-start gap-3.5 rounded-lg px-3.5 py-3.5 text-left transition focus-visible:ring-2 focus-visible:ring-[#4ade80]/50 focus-visible:outline-none ${
        isUnread
          ? "bg-[#1c2736] hover:bg-[#222f3f]"
          : "bg-transparent hover:bg-[#1c2736]/60"
      }`}
    >
      {/* Left rail on hover */}
      <span
        className={`absolute top-2 bottom-2 left-0 w-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100 ${
          isUnread ? presentation.rail : "bg-[#536176]"
        }`}
        aria-hidden
      />

      {/* Icon circle */}
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${presentation.iconBg}`}
      >
        <Icon className={`h-[18px] w-[18px] ${presentation.iconColor}`} aria-hidden />
      </span>

      {/* Content */}
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`text-[13px] font-bold leading-tight ${
              isUnread ? "text-white" : "text-[#c4cedc]"
            }`}
          >
            {notification.title}
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-[#4ade80]">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </span>
        <span className="mt-1 line-clamp-2 block text-[12px] leading-[18px] text-[#7a8ba0] group-hover:text-[#9aaabe]">
          {notification.description}
        </span>
      </span>

      {/* Unread indicator */}
      {isUnread ? (
        <span className="mt-2 h-[7px] w-[7px] shrink-0 rounded-full bg-[#58a6ff] shadow-[0_0_6px_rgba(88,166,255,0.4)]" />
      ) : null}
    </button>
  );
}

interface NotificationButtonProps {
  accountId?: string | null;
}

export default function NotificationButton({ accountId }: NotificationButtonProps) {
  const router = useRouter();
  const t = useTranslations("nav");
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [notifications, setNotifications] = useState<
    MarketplaceNotification[]
  >([]);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );
  const visibleNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((notification) => !notification.readAt)
        : notifications,
    [filter, notifications],
  );

  useEffect(() => {
    setNotifications(readMarketplaceNotifications(accountId));
    return subscribeMarketplaceNotifications(setNotifications, accountId);
  }, [accountId]);

  const handleSelectNotification = (notification: MarketplaceNotification) => {
    markMarketplaceNotificationRead(notification.id, accountId);
    setIsOpen(false);

    if (notification.href) {
      router.push(notification.href);
    }
  };

  const handleMarkAllRead = () => {
    markAllMarketplaceNotificationsRead(accountId);
    setFilter("all");
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={notificationRef} className="relative">
      <button
        type="button"
        aria-label={t("notificationsTitle")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-steel-500 transition hover:bg-white/[0.06] hover:text-dm-text-primary focus-visible:ring-2 focus-visible:ring-[#4ade80]/70 focus-visible:outline-none"
      >
        <Bell size={24} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] leading-none font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label={t("notificationsTitle")}
          className="fixed top-[78px] right-3 left-3 z-[90] max-h-[calc(100vh-96px)] overflow-hidden rounded-xl border border-[#2a3545] bg-[#161e28] text-white shadow-[0_24px_64px_rgba(0,0,0,0.55)] sm:absolute sm:top-[calc(100%+14px)] sm:right-0 sm:left-auto sm:w-[400px]"
        >
          {/* Arrow */}
          <span
            className="absolute -top-2 right-9 hidden h-4 w-4 rotate-45 border-t border-l border-[#2a3545] bg-[#161e28] sm:block"
            aria-hidden
          />

          {/* Header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-[6px] w-[6px] rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#6b7a8d] uppercase">
                    {t("activityCenter")}
                  </p>
                </div>
                <h2 className="mt-2.5 text-xl leading-none font-bold tracking-tight">
                  {t("notificationsTitle")}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <span className="rounded-md border border-[#4ade80]/20 bg-[#4ade80]/10 px-2.5 py-1 text-[11px] font-bold text-[#4ade80]">
                    {unreadCount} {t("unreadBadge")}
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label={t("markAllAsReadLabel")}
                  onClick={handleMarkAllRead}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7a8d] transition hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-[#4ade80]/70 focus-visible:outline-none"
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="mx-5 grid grid-cols-2 rounded-lg bg-[#111923] p-[3px] ring-1 ring-white/[0.04]">
            <button
              type="button"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              className={`rounded-md py-2 text-[13px] font-bold transition focus-visible:ring-2 focus-visible:ring-[#4ade80]/70 focus-visible:outline-none ${
                filter === "all"
                  ? "bg-[#2a3545] text-white shadow-sm"
                  : "text-[#6b7a8d] hover:text-[#9aaabe]"
              }`}
            >
              {t("all")}
            </button>
            <button
              type="button"
              aria-pressed={filter === "unread"}
              onClick={() => setFilter("unread")}
              className={`rounded-md py-2 text-[13px] font-bold transition focus-visible:ring-2 focus-visible:ring-[#4ade80]/70 focus-visible:outline-none ${
                filter === "unread"
                  ? "bg-[#2a3545] text-white shadow-sm"
                  : "text-[#6b7a8d] hover:text-[#9aaabe]"
              }`}
            >
              {t("unread")}
            </button>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <span className="text-[10px] font-bold tracking-[0.14em] text-[#6b7a8d] uppercase">
              {t("recentActivity")}
            </span>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-[12px] font-semibold text-[#58a6ff] transition hover:text-[#8fc5ff] focus-visible:ring-2 focus-visible:ring-[#4ade80]/70 focus-visible:outline-none"
            >
              {t("seeAll")}
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[min(480px,calc(100vh-310px))] space-y-0.5 overflow-y-auto px-2 pb-3 [scrollbar-color:#3a4a5c_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#3a4a5c] [&::-webkit-scrollbar-track]:bg-transparent">
            {visibleNotifications.length > 0 ? (
              visibleNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onSelect={handleSelectNotification}
                />
              ))
            ) : (
              <div className="mx-3 rounded-lg border border-dashed border-white/[0.06] bg-[#111923]/70 px-4 py-8 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#1e2630]">
                  <Clock3 className="h-5 w-5 text-[#6b7a8d]" />
                </span>
                <p className="mt-3 text-sm font-semibold text-white">
                  {t("caughtUp")}
                </p>
                <p className="mt-1 text-[12px] text-[#6b7a8d]">
                  {t("caughtUpDescription")}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
