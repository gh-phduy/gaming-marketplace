/* ==========================================================================
   CONSTANTS & TYPE DEFINITIONS
   ========================================================================== */

export const CHECKOUT_ORDER_STORAGE_KEY = "difmark_checkout_order";

export type CheckoutOrderItem = {
  id: string;
  name: string;
  platform: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
};

export type CheckoutOrderSnapshot = {
  topUp?: import("@/lib/payments/topup").TopUpSelection;
  items: CheckoutOrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  createdAt: string;
};

/* ==========================================================================
   TYPE GUARDS & VALIDATORS
   ========================================================================== */

/**
 * Validates that an unknown value matches the CheckoutOrderItem structure.
 */
function isCheckoutOrderItem(value: unknown): value is CheckoutOrderItem {
  if (!value || typeof value !== "object") return false;

  const item = value as CheckoutOrderItem;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.platform === "string" &&
    typeof item.image === "string" &&
    typeof item.price === "number" &&
    typeof item.currency === "string" &&
    typeof item.quantity === "number"
  );
}

/**
 * Validates that an unknown value matches the CheckoutOrderSnapshot structure.
 */
function isCheckoutOrderSnapshot(
  value: unknown,
): value is CheckoutOrderSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as CheckoutOrderSnapshot;
  return (
    Array.isArray(snapshot.items) &&
    snapshot.items.every(isCheckoutOrderItem) &&
    typeof snapshot.subtotal === "number" &&
    typeof snapshot.total === "number" &&
    typeof snapshot.currency === "string" &&
    typeof snapshot.createdAt === "string"
  );
}

/* ==========================================================================
   SESSION STORAGE ACTIONS
   ========================================================================== */

/**
 * Reads and parses the active checkout snapshot from sessionStorage.
 * Performs type checks and returns null if corrupt or missing.
 */
export function readCheckoutOrderSnapshot() {
  if (typeof window === "undefined") return null;

  const storedSnapshot = window.sessionStorage.getItem(
    CHECKOUT_ORDER_STORAGE_KEY,
  );
  if (!storedSnapshot) return null;

  try {
    const parsed = JSON.parse(storedSnapshot) as unknown;
    return isCheckoutOrderSnapshot(parsed) ? parsed : null;
  } catch {
    window.sessionStorage.removeItem(CHECKOUT_ORDER_STORAGE_KEY);
    return null;
  }
}

/**
 * Serializes and saves a checkout snapshot to sessionStorage
 * to persist order data during page transitions and third-party payment redirects.
 */
export function saveCheckoutOrderSnapshot(snapshot: CheckoutOrderSnapshot) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    CHECKOUT_ORDER_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
}

