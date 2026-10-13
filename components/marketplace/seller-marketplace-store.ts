"use client";

import { supabase } from "@/lib/supabase";
import { listingCategories, sellerListingSchema } from "@/lib/seller-listing";

export type SellerListingStatus = "draft" | "published" | "paused";

export interface SellerListing {
  id: string;
  title: string;
  productType: string;
  platform: string;
  edition: string;
  activationRegion: string;
  delivery: string;
  stock: number;
  price: number;
  currency: string;
  imageUrl: string;
  description: string;
  status: SellerListingStatus;
  views: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
}

export type SellerMessageSenderRole = "buyer" | "seller";

export interface SellerConversationMessage {
  id: string;
  senderRole: SellerMessageSenderRole;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
}

export interface SellerConversation {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  listingTitle: string;
  unreadForSeller: number;
  unreadForBuyer: number;
  messages: SellerConversationMessage[];
  updatedAt: string;
}

export interface SellerListingInput {
  title: string;
  productType: string;
  platform: string;
  edition: string;
  activationRegion: string;
  delivery: string;
  stock: number;
  price: number;
  currency: string;
  imageUrl: string;
  description: string;
  status: SellerListingStatus;
}

export interface SellerConversationIdentity {
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  buyerId?: string;
  buyerName?: string;
  buyerAvatar?: string;
  listingTitle?: string;
}

export const CURRENT_SELLER_ID = "usr_001";
export const SELLER_MARKETPLACE_EVENT = "difmark:seller-marketplace-changed";

const SELLER_LISTINGS_STORAGE_KEY = "difmark_seller_listings";
const SELLER_CONVERSATIONS_STORAGE_KEY = "difmark_seller_conversations";
const MAX_CONVERSATION_MESSAGES = 120;

const now = Date.now();

const seedListings: SellerListing[] = [];

const seedConversations: SellerConversation[] = [];

function dispatchSellerMarketplaceChange() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(SELLER_MARKETPLACE_EVENT));
}

function getSellerListingsStorageKey(accountId?: string | null) {
  const normalizedAccountId = accountId?.trim();
  if (!normalizedAccountId) return SELLER_LISTINGS_STORAGE_KEY;

  return `${SELLER_LISTINGS_STORAGE_KEY}:${normalizedAccountId}`;
}

function getSeedListings(accountId?: string | null) {
  return accountId?.trim() ? [] : seedListings;
}

function sortListings(listings: SellerListing[]) {
  return [...listings].sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() -
      new Date(first.updatedAt).getTime(),
  );
}

function sortConversations(conversations: SellerConversation[]) {
  return [...conversations].sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() -
      new Date(first.updatedAt).getTime(),
  );
}

function isSellerListing(value: unknown): value is SellerListing {
  if (!value || typeof value !== "object") return false;

  const listing = value as SellerListing;
  return (
    typeof listing.id === "string" &&
    typeof listing.title === "string" &&
    typeof listing.productType === "string" &&
    typeof listing.platform === "string" &&
    typeof listing.edition === "string" &&
    typeof listing.activationRegion === "string" &&
    typeof listing.delivery === "string" &&
    typeof listing.stock === "number" &&
    typeof listing.price === "number" &&
    typeof listing.currency === "string" &&
    typeof listing.imageUrl === "string" &&
    typeof listing.description === "string" &&
    ["draft", "published", "paused"].includes(listing.status) &&
    typeof listing.views === "number" &&
    typeof listing.sales === "number" &&
    typeof listing.createdAt === "string" &&
    typeof listing.updatedAt === "string"
  );
}

function isSellerConversationMessage(
  value: unknown,
): value is SellerConversationMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as SellerConversationMessage;
  return (
    typeof message.id === "string" &&
    (message.senderRole === "buyer" || message.senderRole === "seller") &&
    typeof message.senderName === "string" &&
    typeof message.senderAvatar === "string" &&
    typeof message.text === "string" &&
    typeof message.createdAt === "string"
  );
}

function isSellerConversation(value: unknown): value is SellerConversation {
  if (!value || typeof value !== "object") return false;

  const conversation = value as SellerConversation;
  return (
    typeof conversation.id === "string" &&
    typeof conversation.sellerId === "string" &&
    typeof conversation.sellerName === "string" &&
    typeof conversation.sellerAvatar === "string" &&
    typeof conversation.buyerId === "string" &&
    typeof conversation.buyerName === "string" &&
    typeof conversation.buyerAvatar === "string" &&
    typeof conversation.listingTitle === "string" &&
    typeof conversation.unreadForSeller === "number" &&
    typeof conversation.unreadForBuyer === "number" &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every(isSellerConversationMessage) &&
    typeof conversation.updatedAt === "string"
  );
}

function safeReadArray<T>(
  storageKey: string,
  guard: (value: unknown) => value is T,
  fallback: T[],
) {
  if (typeof window === "undefined") return fallback;

  const storedValue = window.localStorage.getItem(storageKey);
  if (!storedValue) return fallback;

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    if (!Array.isArray(parsed)) return fallback;

    return parsed.filter(guard);
  } catch {
    window.localStorage.removeItem(storageKey);
    return fallback;
  }
}

const mapDbProductToListing = (row: any): SellerListing => {
  return {
    id: row.id,
    title: row.title,
    productType: Object.keys(listingCategories).find(label => listingCategories[label] === row.category) || row.category,
    platform: row.platform || "PC",
    edition: row.edition || "Standard",
    activationRegion: row.region,
    delivery: row.delivery || "Instant",
    stock: row.stock,
    price: Number(row.price),
    currency: row.currency,
    imageUrl: row.image_url || "/cyberpunk_2077.jpg",
    description: row.description || "",
    status: row.status as SellerListingStatus,
    views: row.views || 0,
    sales: row.sales || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export async function readSellerListings(accountId?: string | null): Promise<SellerListing[]> {
  if (!accountId) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", accountId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error reading products from Supabase:", error);
    throw error;
  }

  return (data || []).map(mapDbProductToListing);
}

export function saveSellerListings(
  listings: SellerListing[],
  accountId?: string | null,
) {
  // Deprecated: No longer using localStorage
  dispatchSellerMarketplaceChange();
}

async function requireSellerAccount(accountId?: string | null) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.id !== accountId) throw new Error("Please sign in again before changing products.");
}

export async function createSellerListing(
  input: SellerListingInput,
  accountId?: string | null,
) {
  if (!accountId) throw new Error("Account ID is required to create a listing.");
  const parsed = sellerListingSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid product details.");
  await requireSellerAccount(accountId);
  input = parsed.data;

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: accountId,
      title: input.title,
      description: input.description,
      price: input.price,
      currency: input.currency,
      category: listingCategories[input.productType] || input.productType,
      platform: input.platform,
      region: input.activationRegion,
      edition: input.edition,
      delivery: input.delivery,
      stock: input.stock,
      image_url: input.imageUrl || null,
      status: input.status,
      is_new: input.status === "published",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product in Supabase:", error);
    throw error;
  }

  dispatchSellerMarketplaceChange();
  return mapDbProductToListing(data);
}

export async function updateSellerListingStatus(
  listingId: string,
  status: SellerListingStatus,
  accountId?: string | null,
) {
  await requireSellerAccount(accountId);
  const { data, error } = await supabase
    .from("products")
    .update({
      status,
      is_new: status === "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .eq("seller_id", accountId!)
    .select()
    .single();

  if (error) {
    console.error("Error updating product status in Supabase:", error);
    throw error;
  }

  dispatchSellerMarketplaceChange();
  return mapDbProductToListing(data);
}

export async function deleteSellerListing(
  listingId: string,
  accountId?: string | null,
) {
  await requireSellerAccount(accountId);
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", listingId)
    .eq("seller_id", accountId!)
    .select("id")
    .single();

  if (error) {
    console.error("Error deleting product from Supabase:", error);
    throw error;
  }

  dispatchSellerMarketplaceChange();
}

export async function getSellerConversations(sellerId: string): Promise<SellerConversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      seller:users!conversations_seller_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      buyer:users!conversations_buyer_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      messages (
        id,
        sender_id,
        text,
        created_at
      )
    `)
    .eq("seller_id", sellerId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error reading conversations from Supabase:", error);
    return [];
  }

  const mapDbConversation = (row: any): SellerConversation => {
    const seller = row.seller;
    const buyer = row.buyer;
    const sortedMessages = (row.messages || []).sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return {
      id: row.id,
      sellerId: row.seller_id,
      sellerName: seller?.display_name || "Seller",
      sellerAvatar: seller?.avatar_url || "/avt1.png",
      buyerId: row.buyer_id,
      buyerName: buyer?.display_name || "Buyer",
      buyerAvatar: buyer?.avatar_url || "/avt2.png",
      listingTitle: row.listing_title || "General Inquiry",
      unreadForSeller: row.unread_for_seller || 0,
      unreadForBuyer: row.unread_for_buyer || 0,
      updatedAt: row.updated_at,
      messages: sortedMessages.map((msg: any) => {
        const isSellerSender = msg.sender_id === row.seller_id;
        return {
          id: msg.id,
          senderRole: isSellerSender ? "seller" : "buyer",
          senderName: isSellerSender 
            ? (seller?.display_name || "Seller") 
            : (buyer?.display_name || "Buyer"),
          senderAvatar: isSellerSender 
            ? (seller?.avatar_url || "/avt1.png") 
            : (buyer?.avatar_url || "/avt2.png"),
          text: msg.text,
          createdAt: msg.created_at,
        };
      }),
    };
  };

  return (data || []).map(mapDbConversation);
}

export function saveSellerConversations(conversations: SellerConversation[]) {
  // Deprecated: No longer using localStorage
  dispatchSellerMarketplaceChange();
}

export function getSellerUnreadConversationCount(conversations: SellerConversation[]) {
  return conversations.reduce(
    (total, conversation) => total + conversation.unreadForSeller,
    0,
  );
}

export async function getOrCreateSellerConversation({
  sellerId,
  buyerId,
  listingTitle = "General Inquiry",
}: {
  sellerId: string;
  buyerId: string;
  listingTitle?: string;
}): Promise<SellerConversation> {
  const conversationResult = await supabase
    .from("conversations")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("buyer_id", buyerId)
    .eq("listing_title", listingTitle)
    .maybeSingle();
  const { error } = conversationResult;
  let { data: conversation } = conversationResult;

  if (error) {
    console.error("Error fetching conversation:", error);
  }

  if (!conversation) {
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({
        seller_id: sellerId,
        buyer_id: buyerId,
        listing_title: listingTitle,
      })
      .select()
      .single();

    if (createError) throw createError;
    conversation = newConv;
  }

  const { data: fullConv } = await supabase
    .from("conversations")
    .select(`
      *,
      seller:users!conversations_seller_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      buyer:users!conversations_buyer_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      messages (
        id,
        sender_id,
        text,
        created_at
      )
    `)
    .eq("id", conversation.id)
    .single();

  const mapDbConversation = (row: any): SellerConversation => {
    const seller = row.seller;
    const buyer = row.buyer;
    const sortedMessages = (row.messages || []).sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return {
      id: row.id,
      sellerId: row.seller_id,
      sellerName: seller?.display_name || "Seller",
      sellerAvatar: seller?.avatar_url || "/avt1.png",
      buyerId: row.buyer_id,
      buyerName: buyer?.display_name || "Buyer",
      buyerAvatar: buyer?.avatar_url || "/avt2.png",
      listingTitle: row.listing_title || "General Inquiry",
      unreadForSeller: row.unread_for_seller || 0,
      unreadForBuyer: row.unread_for_buyer || 0,
      updatedAt: row.updated_at,
      messages: sortedMessages.map((msg: any) => {
        const isSellerSender = msg.sender_id === row.seller_id;
        return {
          id: msg.id,
          senderRole: isSellerSender ? "seller" : "buyer",
          senderName: isSellerSender 
            ? (seller?.display_name || "Seller") 
            : (buyer?.display_name || "Buyer"),
          senderAvatar: isSellerSender 
            ? (seller?.avatar_url || "/avt1.png") 
            : (buyer?.avatar_url || "/avt2.png"),
          text: msg.text,
          createdAt: msg.created_at,
        };
      }),
    };
  };

  return mapDbConversation(fullConv);
}

export async function sendSellerConversationMessage(
  conversationId: string,
  message: Omit<SellerConversationMessage, "id" | "createdAt">,
) {
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("seller_id, buyer_id")
    .eq("id", conversationId)
    .single();

  if (convError || !conversation) {
    throw new Error(`Failed to find conversation: ${convError?.message}`);
  }

  const senderId = message.senderRole === "seller" 
    ? conversation.seller_id 
    : conversation.buyer_id;

  const { data: newMsg, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text: message.text,
    })
    .select()
    .single();

  if (msgError) throw msgError;

  // The messages INSERT trigger updates unread counts atomically for both chat UIs.

  dispatchSellerMarketplaceChange();

  const { data: updatedConv } = await supabase
    .from("conversations")
    .select(`
      *,
      seller:users!conversations_seller_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      buyer:users!conversations_buyer_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      messages (
        id,
        sender_id,
        text,
        created_at
      )
    `)
    .eq("id", conversationId)
    .single();

  const mapDbConversation = (row: any): SellerConversation => {
    const seller = row.seller;
    const buyer = row.buyer;
    const sortedMessages = (row.messages || []).sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return {
      id: row.id,
      sellerId: row.seller_id,
      sellerName: seller?.display_name || "Seller",
      sellerAvatar: seller?.avatar_url || "/avt1.png",
      buyerId: row.buyer_id,
      buyerName: buyer?.display_name || "Buyer",
      buyerAvatar: buyer?.avatar_url || "/avt2.png",
      listingTitle: row.listing_title || "General Inquiry",
      unreadForSeller: row.unread_for_seller || 0,
      unreadForBuyer: row.unread_for_buyer || 0,
      updatedAt: row.updated_at,
      messages: sortedMessages.map((msg: any) => {
        const isSellerSender = msg.sender_id === row.seller_id;
        return {
          id: msg.id,
          senderRole: isSellerSender ? "seller" : "buyer",
          senderName: isSellerSender 
            ? (seller?.display_name || "Seller") 
            : (buyer?.display_name || "Buyer"),
          senderAvatar: isSellerSender 
            ? (seller?.avatar_url || "/avt1.png") 
            : (buyer?.avatar_url || "/avt2.png"),
          text: msg.text,
          createdAt: msg.created_at,
        };
      }),
    };
  };

  return mapDbConversation(updatedConv);
}

export async function markSellerConversationRead(
  conversationId: string,
  role: SellerMessageSenderRole,
) {
  const updatePayload: any = {};
  if (role === "seller") {
    updatePayload.unread_for_seller = 0;
  } else {
    updatePayload.unread_for_buyer = 0;
  }

  await supabase
    .from("conversations")
    .update(updatePayload)
    .eq("id", conversationId);

  dispatchSellerMarketplaceChange();
}

export function subscribeSellerMarketplace(
  callback: () => void,
  accountId?: string | null,
) {
  if (typeof window === "undefined" || !accountId) return () => {};

  // Listen to message inserts for any conversation where the user is either the seller or the buyer
  const subscription = supabase
    .channel(`dashboard-chats:${accountId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        // Trigger sync whenever a new message is inserted in our rooms
        callback();
      }
    )
    .subscribe();

  window.addEventListener(SELLER_MARKETPLACE_EVENT, callback);

  return () => {
    void supabase.removeChannel(subscription);
    window.removeEventListener(SELLER_MARKETPLACE_EVENT, callback);
  };
}

export function formatSellerStoreTime(value: string) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "now";

  const elapsed = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsed < minute) return "now";
  if (elapsed < hour) return `${Math.floor(elapsed / minute)}m`;
  if (elapsed < day) return `${Math.floor(elapsed / hour)}h`;
  if (elapsed < 2 * day) return "Yesterday";

  return `${Math.floor(elapsed / day)}d`;
}
