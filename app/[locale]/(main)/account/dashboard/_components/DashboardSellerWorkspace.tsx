"use client";

import React from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  PackagePlus,
  ShieldCheck,
  Store,
} from "lucide-react";
import type { UserDashboardProfile } from "../_lib/dashboard.data";
import {
  useSellerWorkspace,
  type WorkspaceTab,
} from "./useSellerWorkspace";
import {
  formatMoney,
  MetricTile,
} from "./SellerWorkspaceComponents";
import { useTranslations } from "next-intl";

// Import modular workspace tab presentational subcomponents
import { WorkspaceOverview } from "./WorkspaceOverview";
import { WorkspaceListings } from "./WorkspaceListings";
import { WorkspaceCreateOffer } from "./WorkspaceCreateOffer";
import { WorkspaceInbox } from "./WorkspaceInbox";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

interface DashboardSellerWorkspaceProps {
  profile: UserDashboardProfile;
}

const workspaceTabs: Array<{
  id: WorkspaceTab;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Listings", icon: ClipboardList },
  { id: "create", label: "Create offer", icon: PackagePlus },
  { id: "inbox", label: "Inbox", icon: Inbox },
];

/* ==========================================================================
   MAIN COMPONENT: DashboardSellerWorkspace
   ========================================================================== */

/**
 * DashboardSellerWorkspace Component
 *
 * Coordinates tabs navigation (Overview, Listings, Create offer, Inbox),
 * and ties local states and callback handlers from `useSellerWorkspace` hook
 * to their respective tab presentational components.
 */
export default function DashboardSellerWorkspace({
  profile,
}: DashboardSellerWorkspaceProps) {
  const t = useTranslations("dashboard");
  const {
    activeTab,
    setActiveTab,
    listings,
    conversations,
    activeConversation,
    replyText,
    setReplyText,
    formError,
    workspaceError,
    isSaving,
    isUploading,
    toastMessage,
    form,
    stats,
    updateFormField,
    handleUploadImage,
    handleSaveListing,
    handleChangeStatus,
    handleDeleteListing,
    handleSelectConversation,
    handleSendReply,
  } = useSellerWorkspace(profile);

  return (
    <section
      id="seller-workspace"
      className="relative rounded-xl bg-midnight-800 text-white shadow-2xl shadow-black/20"
    >
      {workspaceError && <p role="alert" className="px-6 pt-4 text-sm text-red-300">{workspaceError}</p>}
      {/* Workspace top navigation bar */}
      <div className="relative z-10 border-b border-midnight-700/50 bg-midnight-850/20 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-forest-500/20 bg-forest-500/10 text-forest-500">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-forest-500/80 uppercase">
                  {t("sellerRole")}
                </p>
                <h2 className="bg-[linear-gradient(90deg,#ffffff,#d0f0d6_46%,#62d676)] bg-clip-text text-xl font-bold text-transparent drop-shadow-[0_0_14px_rgba(98,214,118,0.18)]">
                  {t("sellerWorkspace")}
                </h2>
              </div>
            </div>
          </div>

          {/* Navigation tab links */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              const labelMap: Record<WorkspaceTab, string> = {
                overview: t("overview"),
                products: t("listings"),
                create: t("createOffer"),
                inbox: t("inbox"),
              };
              const translatedLabel = labelMap[tab.id] || tab.label;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex h-10 w-full sm:w-auto sm:h-9 items-center justify-center gap-2 rounded-lg px-3 sm:px-4 text-[11px] sm:text-xs font-bold transition duration-200 ${
                    isActive
                      ? "border border-forest-500/80 bg-transparent text-forest-500 shadow-[0_0_12px_rgba(98,214,118,0.18)]"
                      : "text-white hover:text-forest-100"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? "text-forest-500 drop-shadow-[0_0_6px_rgba(98,214,118,0.8)]"
                        : "text-gray-400"
                    }`}
                  />
                  {translatedLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main tab content workspace logs - Inner Slate Box Container */}
      <div className="relative z-10 mx-6 mb-6 mt-6 rounded-xl border border-midnight-700/40 bg-midnight-900/30 p-5 overflow-hidden">
        <div className="relative z-10 space-y-5">
          {/* Core metric status blocks */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricTile
              icon={Store}
              label={t("activeListings")}
              value={`${stats.publishedListings}`}
              detail={`${listings.length} ${t("totalProducts")}`}
            />
            <MetricTile
              icon={CircleDollarSign}
              label={t("grossSales")}
              value={formatMoney(profile.currency.symbol, stats.grossRevenue)}
              detail={`${stats.totalSales} ${t("completedOrders")}`}
            />
            <MetricTile
              icon={MessageCircle}
              label={t("unreadChats")}
              value={`${stats.unreadMessages}`}
              detail={`${conversations.length} ${t("buyerThreads")}`}
            />
            <MetricTile
              icon={ShieldCheck}
              label={t("storeHealth")}
              value={stats.lowStock > 0 ? t("watch") : t("good")}
              detail={
                stats.lowStock > 0
                  ? `${stats.lowStock} ${t("listingsLowStock")}`
                  : t("listingsReady")
              }
            />
          </div>

          {/* Tab switcher renderer */}
          {activeTab === "overview" && (
            <WorkspaceOverview
              profile={profile}
              stats={stats}
              listings={listings}
              conversations={conversations}
              activeConversation={activeConversation}
              setActiveTab={setActiveTab}
              handleSelectConversation={handleSelectConversation}
            />
          )}

          {activeTab === "products" && (
            <WorkspaceListings
              listings={listings}
              handleChangeStatus={handleChangeStatus}
              handleDeleteListing={handleDeleteListing}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "create" && (
            <WorkspaceCreateOffer
              form={form}
              formError={formError}
              isSaving={isSaving}
              isUploading={isUploading}
              updateFormField={updateFormField}
              handleUploadImage={handleUploadImage}
              handleSaveListing={handleSaveListing}
            />
          )}

          {activeTab === "inbox" && (
            <WorkspaceInbox
              conversations={conversations}
              activeConversation={activeConversation}
              replyText={replyText}
              setReplyText={setReplyText}
              handleSelectConversation={handleSelectConversation}
              handleSendReply={handleSendReply}
            />
          )}
        </div>
      </div>

      {/* Floating success notice toast notifications */}
      {toastMessage ? (
        <div className="fixed right-4 bottom-6 left-4 z-[80] mx-auto flex max-w-[520px] items-center gap-3 rounded-lg border border-forest-500/25 bg-[linear-gradient(135deg,rgba(7,12,14,0.96),rgba(29,37,50,0.94))] px-4 py-3 text-sm text-white shadow-[0_0_34px_rgba(98,214,118,0.18)] sm:left-1/2 sm:-translate-x-1/2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d0f0d6,#62d676)] text-midnight-950 shadow-[0_0_18px_rgba(98,214,118,0.38)]">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          {toastMessage}
        </div>
      ) : null}
    </section>
  );
}

