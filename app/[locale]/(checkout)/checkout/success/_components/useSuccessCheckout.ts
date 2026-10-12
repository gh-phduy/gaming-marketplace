"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { paymentRequest } from "@/lib/payments/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  saveCheckoutOrderSnapshot,
  type CheckoutOrderSnapshot,
} from "@/components/checkout/checkout-session";
import { addMarketplaceNotification } from "@/components/notifications/notification-store";
import { useCheckoutPaymentStatus } from "@/components/checkout/CheckoutPaymentStatus";

export const PROCESSED_PAYMENT_INTENT_KEY = "processed_payment_intent";

export function formatCurrency(value: number, currency: string) {
  return `${currency} ${value.toFixed(2)}`;
}

export function truncatePaymentId(paymentIntent: string | null) {
  if (!paymentIntent) return "Unavailable";
  if (paymentIntent.length <= 18) return paymentIntent;
  return `${paymentIntent.slice(0, 12)}...${paymentIntent.slice(-6)}`;
}

function getNotificationDescription(
  snapshot: CheckoutOrderSnapshot | null,
  total: string
) {
  if (!snapshot?.items.length) {
    return `Your payment was confirmed successfully. Total paid: ${total}.`;
  }

  const itemCount = snapshot.items.reduce(
    (count, item) => count + item.quantity,
    0
  );
  const firstItem = snapshot.items[0];
  const extraItems = itemCount > 1 ? ` and ${itemCount - 1} more` : "";

  return `${firstItem.name}${extraItems} ${
    itemCount === 1 ? "was" : "were"
  } paid successfully. Total paid: ${total}.`;
}

export function useSuccessCheckout() {
  const searchParams = useSearchParams();
  const { resetCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { setResult } = useCheckoutPaymentStatus();
  
  const [status, setStatus] = useState<"succeeded" | "failed" | null>(null);
  const [orderSnapshot, setOrderSnapshot] = useState<CheckoutOrderSnapshot | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const paymentIntent = searchParams.get("payment_intent");
  const accountId = user?.id || user?.email || null;

  const verifyAndRecord = useCallback(async (signal?: AbortSignal) => {
    if (!paymentIntent || !user?.id) {
      setStatus("failed");
      setResult(paymentIntent ? { paymentIntent, status: "failed" } : null);
      return;
    }
    setIsSyncing(true);
    setDbError(null);
    try {
      const result = await paymentRequest<{
        status: string;
        recorded: boolean;
        snapshot?: CheckoutOrderSnapshot;
        error?: string;
      }>("/api/payments/verify", { paymentIntent }, signal);
      if (signal?.aborted) return;
      if (result.status !== "succeeded") {
        setStatus("failed");
        setResult({ paymentIntent, status: "failed" });
        return;
      }
      setStatus("succeeded");
      setResult({ paymentIntent, status: "succeeded" });
      setOrderSnapshot(result.snapshot ?? null);
      if (!result.recorded || !result.snapshot) {
        setDbError(result.error || "Payment confirmed, but order recording is pending. Please retry.");
        return;
      }
      const snapshot = result.snapshot;
      saveCheckoutOrderSnapshot(snapshot);
      const processedKey = `${PROCESSED_PAYMENT_INTENT_KEY}:${accountId}`;
      if (localStorage.getItem(processedKey) !== paymentIntent) {
        addMarketplaceNotification({
          id: `payment-${paymentIntent}`, kind: "payment", title: "Payment confirmed",
          description: getNotificationDescription(snapshot, formatCurrency(snapshot.total, snapshot.currency)),
          href: `/checkout/success?payment_intent=${encodeURIComponent(paymentIntent)}`,
        }, accountId);
        if (!snapshot.topUp) resetCart();
        localStorage.setItem(processedKey, paymentIntent);
        setShowToast(true);
      }
    } catch (error) {
      if (!signal?.aborted) {
        setStatus("failed");
        setResult({ paymentIntent, status: "failed" });
        setDbError(error instanceof Error ? error.message : "Unable to verify payment.");
      }
    } finally {
      if (!signal?.aborted) setIsSyncing(false);
    }
  }, [paymentIntent, user?.id, accountId, resetCart, setResult]);

  const saveOrderToDb = () => verifyAndRecord();

  useEffect(() => {
    if (isAuthLoading) return;
    const controller = new AbortController();
    setStatus(null);
    setOrderSnapshot(null);
    setResult(paymentIntent ? { paymentIntent, status: "processing" } : null);
    void verifyAndRecord(controller.signal);
    return () => controller.abort();
  }, [isAuthLoading, verifyAndRecord, paymentIntent, setResult]);

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(false), 6200);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const itemCount = useMemo(
    () =>
      orderSnapshot?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    [orderSnapshot]
  );
  
  const currency = orderSnapshot?.currency ?? "$";
  const total = orderSnapshot?.total ?? 0;
  const formattedTotal = formatCurrency(total, currency);
  const displayedItemCount = itemCount || 1;

  return {
    status,
    orderSnapshot,
    showToast,
    setShowToast,
    dbError,
    isSyncing,
    paymentIntent,
    formattedTotal,
    displayedItemCount,
    user,
    saveOrderToDb,
  };
}
