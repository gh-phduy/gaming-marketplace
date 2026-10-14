"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import CartNotification, {
  type CartNotice,
} from "@/components/shared/CartNotification";

const CART_ITEMS_STORAGE_KEY = "cart_items";

export interface CartItemInput {
  id: string;
  name: string;
  platform: string;
  image: string;
  price: number;
  currency: string;
}

export interface CartItem extends CartItemInput {
  quantity: number;
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as CartItem;
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

function readCartItemsFromStorage() {
  if (typeof window === "undefined") return [];

  const storedItems = window.localStorage.getItem(CART_ITEMS_STORAGE_KEY);
  if (!storedItems) return [];

  try {
    const parsed = JSON.parse(storedItems) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidCartItem).map((item) => ({
      ...item,
      quantity: Number.isFinite(item.quantity)
        ? Math.max(1, Math.floor(item.quantity))
        : 1,
    }));
  } catch {
    window.localStorage.removeItem(CART_ITEMS_STORAGE_KEY);
    return [];
  }
}

function writeCartItemsToStorage(cartItems: CartItem[]) {
  if (typeof window === "undefined") return;

  if (cartItems.length === 0) {
    window.localStorage.removeItem(CART_ITEMS_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    CART_ITEMS_STORAGE_KEY,
    JSON.stringify(cartItems),
  );
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: CartItemInput) => void;
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  resetCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasHydratedCart, setHasHydratedCart] = useState(false);
  const [notification, setNotification] = useState<CartNotice | null>(null);
  const dismissNotification = useCallback(() => setNotification(null), []);

  useEffect(() => {
    const savedItems = readCartItemsFromStorage();
    // Keep the initial empty array stable so every card does not render again.
    if (savedItems.length) setCartItems(savedItems);
    setHasHydratedCart(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedCart) {
      return;
    }

    writeCartItemsToStorage(cartItems);
  }, [cartItems, hasHydratedCart]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const addToCart = (item: CartItemInput) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) => cartItem.id === item.id,
      );
      if (existingIndex === -1) {
        const nextCartItems = [...prev, { ...item, quantity: 1 }];
        writeCartItemsToStorage(nextCartItems);
        return nextCartItems;
      }

      const nextCartItems = prev.map((cartItem, index) =>
        index === existingIndex
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      );
      writeCartItemsToStorage(nextCartItems);
      return nextCartItems;
    });
    setNotification({ type: "added", name: item.name });
  };

  const incrementItem = (itemId: string) => {
    setCartItems((prev) => {
      const nextCartItems = prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
      );
      writeCartItemsToStorage(nextCartItems);
      return nextCartItems;
    });
  };

  const decrementItem = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;
    setCartItems((prev) => {
      const nextCartItems = prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0);
      writeCartItemsToStorage(nextCartItems);
      return nextCartItems;
    });
    if (item.quantity === 1) {
      setNotification({ type: "removed", name: item.name });
    }
  };

  const removeItem = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;
    setCartItems((prev) => {
      const nextCartItems = prev.filter((item) => item.id !== itemId);
      writeCartItemsToStorage(nextCartItems);
      return nextCartItems;
    });
    setNotification({ type: "removed", name: item.name });
  };

  const resetCart = useCallback(() => {
    setCartItems([]);
    writeCartItemsToStorage([]);
  }, []);

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      addToCart,
      incrementItem,
      decrementItem,
      removeItem,
      resetCart,
    }),
    [cartItems, cartCount],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartNotification
        notification={notification}
        onDismiss={dismissNotification}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
