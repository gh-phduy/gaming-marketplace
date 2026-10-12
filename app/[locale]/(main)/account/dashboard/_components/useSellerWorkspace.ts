"use client";

import { type ChangeEvent, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { uploadListingImage } from "@/lib/listing-image-upload";
import { normalizeListingCurrency } from "@/lib/seller-listing";
import type { UserDashboardProfile } from "../_lib/dashboard.data";
import {
  createSellerListing,
  deleteSellerListing,
  getSellerConversations,
  markSellerConversationRead,
  readSellerListings,
  sendSellerConversationMessage,
  subscribeSellerMarketplace,
  updateSellerListingStatus,
  type SellerConversation,
  type SellerListing,
  type SellerListingStatus,
} from "@/components/marketplace/seller-marketplace-store";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

export interface ListingFormState {
  title: string;
  productType: string;
  platform: string;
  edition: string;
  activationRegion: string;
  delivery: string;
  stock: string;
  price: string;
  currency: string;
  imageUrl: string;
  description: string;
}

/* ==========================================================================
   STATIC CONFIGURATION OPTIONS
   ========================================================================== */

export const productTypeOptions = [
  "Product key",
  "Gift card",
  "Game currency",
  "Game account",
  "Game item",
  "Software license",
  "Power leveling",
];

export const platformOptions = [
  "Steam",
  "PC",
  "PS5",
  "PS4",
  "Xbox Series X/S",
  "Xbox One",
  "Nintendo Switch",
  "Xbox Live",
  "PlayStation Store",
  "Nintendo eShop",
  "Epic Games",
  "Microsoft",
  "Riot Games",
  "Global service",
];

export const deliveryOptions = ["Instant", "Up to 15 min", "Up to 1 hour", "Manual"];
export const regionOptions = ["Global", "Europe", "United States", "Vietnam", "Asia"];

export const imageOptions = [
  { label: "Default placeholder", value: "/placeholder_product.svg" },
  { label: "Valorant cover", value: "/topup-valorant.jpg" },
  { label: "Software cover", value: "/product1.png" },
];

export type WorkspaceTab = "overview" | "products" | "create" | "inbox";

function errorMessage(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : fallback;
}

/* ==========================================================================
   HELPER CONSTRUCTORS
   ========================================================================== */

/**
 * Creates an empty default listing form state pre-populated with localized currency.
 */
export function createEmptyListingForm(currencySymbol: string): ListingFormState {
  return {
    title: "",
    productType: productTypeOptions[0],
    platform: platformOptions[0],
    edition: "Standard",
    activationRegion: regionOptions[0],
    delivery: deliveryOptions[0],
    stock: "10",
    price: "9.99",
    currency: normalizeListingCurrency(currencySymbol),
    imageUrl: imageOptions[0].value,
    description: "",
  };
}

/* ==========================================================================
   CUSTOM STATE HOOK: useSellerWorkspace
   ========================================================================== */

/**
 * useSellerWorkspace State Hook
 *
 * Encapsulates listing mutations, Supabase polling query feeds, image upload base64
 * conversions, validation logic, and real-time chat updates for the seller workspace dashboard.
 */
export function useSellerWorkspace(profile: UserDashboardProfile) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [conversations, setConversations] = useState<SellerConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const saving = useRef(false);
  const uploading = useRef(false);
  const syncRevision = useRef(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ListingFormState>(() =>
    createEmptyListingForm(profile.currency.code)
  );

  // Sync current list catalog and conversations from marketplace store
  const syncMarketplaceState = useCallback(async () => {
    const revision = ++syncRevision.current;
    const [listingResult, conversationResult] = await Promise.allSettled([
      readSellerListings(profile.id), getSellerConversations(profile.id),
    ]);
    if (revision !== syncRevision.current) return;
    if (listingResult.status === "fulfilled") {
      setListings(listingResult.value);
      setWorkspaceError(null);
    } else {
      console.error("Failed to read seller listings:", listingResult.reason);
      setWorkspaceError("Could not load your products. Please refresh and try again.");
    }
    if (conversationResult.status === "fulfilled") {
      const nextConversations = conversationResult.value;
      setConversations(nextConversations);
      setActiveConversationId(currentId => currentId && nextConversations.some(item => item.id === currentId)
        ? currentId : nextConversations[0]?.id ?? null);
    } else {
      console.error("Failed to read seller conversations:", conversationResult.reason);
    }
  }, [profile.id]);

  // Setup database listener subscriptions
  useEffect(() => {
    syncMarketplaceState();
    return subscribeSellerMarketplace(syncMarketplaceState, profile.id);
  }, [profile.id, syncMarketplaceState]);

  // Navigate to inbox if location anchor hash changes
  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash === "#seller-inbox") {
        setActiveTab("inbox");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => {
      window.removeEventListener("hashchange", applyHash);
    };
  }, []);

  // Mark conversations read when inbox thread opens
  useEffect(() => {
    if (activeTab === "inbox" && activeConversationId) {
      void markSellerConversationRead(activeConversationId, "seller");
    }
  }, [activeConversationId, activeTab]);

  // Handle toast notifications delay limits
  useEffect(() => {
    if (!toastMessage) return;
    const timeoutId = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  // Aggregate statistics metrics
  const stats = useMemo(() => {
    const publishedListings = listings.filter((listing) => listing.status === "published");
    const totalSales = listings.reduce((total, listing) => total + listing.sales, 0);
    const grossRevenue = listings.reduce((total, listing) => total + listing.sales * listing.price, 0);
    const unreadMessages = conversations.reduce((total, conversation) => total + conversation.unreadForSeller, 0);

    return {
      publishedListings: publishedListings.length,
      totalSales,
      grossRevenue,
      unreadMessages,
      lowStock: listings.filter((listing) => listing.stock <= 5).length,
    };
  }, [conversations, listings]);

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0];

  const updateFormField = (field: keyof ListingFormState, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Store uploaded images in Supabase Storage; products store only the public URL.
  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading.current || saving.current) return;
    uploading.current = true;
    setIsUploading(true);
    setFormError(null);
    try {
      const imageUrl = await uploadListingImage(file, profile.id);
      updateFormField("imageUrl", imageUrl);
      setFormError(null);
      showToast("Image uploaded");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not upload this image.");
    } finally {
      uploading.current = false;
      setIsUploading(false);
    }
  };

  // Save or publish new listing offer details
  const handleSaveListing = async (status: SellerListingStatus) => {
    if (saving.current || uploading.current) return;
    const title = form.title.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!title) {
      setFormError("Product name is required.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("Stock must be a whole number.");
      return;
    }

    saving.current = true;
    syncRevision.current += 1;
    setIsSaving(true);
    setFormError(null);
    try {
      const created = await createSellerListing(
        {
          title,
          productType: form.productType,
          platform: form.platform,
          edition: form.edition.trim() || "Standard",
          activationRegion: form.activationRegion,
          delivery: form.delivery,
          stock,
          price,
          currency: form.currency,
          imageUrl: form.imageUrl,
          description:
            form.description.trim() || "Digital product with protected marketplace checkout.",
          status,
        },
        profile.id
      );

      setListings(current => [created, ...current.filter(item => item.id !== created.id)]);
      setForm(createEmptyListingForm(profile.currency.code));
      setFormError(null);
      setActiveTab("products");
      showToast(status === "published" ? "Product published" : "Draft saved");
    } catch (err) {
      console.error("Failed to create product:", err);
      setFormError(errorMessage(err, "Failed to save product to the database."));
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  // Toggle listing status between published and paused draft states
  const handleChangeStatus = async (listingId: string, status: SellerListingStatus) => {
    syncRevision.current += 1;
    try {
      const updated = await updateSellerListingStatus(listingId, status, profile.id);
      setListings(current => current.map(item => item.id === updated.id ? updated : item));
      showToast(`Listing moved to ${status}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast(errorMessage(err, "Failed to update status"));
    }
  };

  // Delete product offer from database
  const handleDeleteListing = async (listingId: string) => {
    syncRevision.current += 1;
    try {
      await deleteSellerListing(listingId, profile.id);
      setListings(current => current.filter(item => item.id !== listingId));
      showToast("Listing deleted");
    } catch (err) {
      console.error("Failed to delete listing:", err);
      showToast(errorMessage(err, "Failed to delete listing"));
    }
  };

  // Set active thread ID and mark unreads read
  const handleSelectConversation = async (conversationId: string) => {
    setActiveConversationId(conversationId);
    try {
      await markSellerConversationRead(conversationId, "seller");
    } catch (err) {
      console.error("Failed to mark conversation read:", err);
    }
  };

  // Send messaging reply back to buyer
  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !activeConversation) return;

    try {
      await sendSellerConversationMessage(activeConversation.id, {
        senderRole: "seller",
        senderName: activeConversation.sellerName,
        senderAvatar: activeConversation.sellerAvatar,
        text,
      });
      await markSellerConversationRead(activeConversation.id, "seller");
      setReplyText("");
      showToast("Reply sent");
    } catch (err) {
      console.error("Failed to send reply:", err);
      showToast("Failed to send reply");
    }
  };

  return {
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
  };
}

