"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import {
  readCheckoutOrderSnapshot,
  type CheckoutOrderItem,
  type CheckoutOrderSnapshot,
} from "@/components/checkout/checkout-session";
import { ProductApiResponse } from "@/types/api-product";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { paymentRequest } from "@/lib/payments/client";
import { findTopUpPackage, validateTopUpSelection, type TopUpSelection } from "@/lib/payments/topup";
import dynamic from "next/dynamic";

const SignIn = dynamic(() => import("@/components/auth/SignIn"));

type PreparedPayment = { clientSecret: string; amount: number; items: CheckoutOrderItem[]; cartKey: string };

// Import modular presentational components
import { PaymentFilters } from "./PaymentFilters";
import { CurrencyWarningBanner } from "./CurrencyWarningBanner";
import { CheckoutTotalCard } from "./CheckoutTotalCard";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";

/* ==========================================================================
   MAIN COMPONENT: CheckoutClient Page Coordinator
   ========================================================================== */

/**
 * CheckoutClient Component
 *
 * Coordinates checkout flow. Performs calculations for cart total additions or
 * direct topup orders, builds PaymentIntents from Stripe API endpoints, and
 * maps mock seller data configurations.
 */
export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isDirectTopUpCheckout = searchParams.get("directTopUp") === "1";
  const { cartItems } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Component local states
  const [preparedPayment, setPreparedPayment] = useState<PreparedPayment | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [retry, setRetry] = useState(0);
  const [topUpSelection, setTopUpSelection] = useState<TopUpSelection | null>(null);
  const [topUpDetailsConfirmed, setTopUpDetailsConfirmed] = useState(false);
  const requestIds = useRef(new Map<string, string>());
  const [directTopUpOrder, setDirectTopUpOrder] = useState<
    CheckoutOrderSnapshot | null | undefined
  >(undefined);
  const [productData, setProductData] = useState<ProductApiResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Memoized lazy initializer for loadStripe promise wrapper
  const stripePromise = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return null;
    }

    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }, []);

  // Compute total value sum of standard items in the cart
  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  // Compute actual billing total based on routing flow parameters
  const amount = useMemo(() => {
    if (isDirectTopUpCheckout && directTopUpOrder)
      return directTopUpOrder.total;
    if (isDirectTopUpCheckout) return 0;
    if (!productId && cartTotal > 0) return cartTotal;
    if (productData?.data.price) return productData.data.price;
    return 0;
  }, [
    cartTotal,
    directTopUpOrder,
    isDirectTopUpCheckout,
    productData?.data.price,
    productId,
  ]);

  // Consolidate array list of items being purchased
  const orderItems = useMemo<CheckoutOrderItem[]>(() => {
    if (productData) {
      return [
        {
          id: productData.data.id,
          name: productData.data.name,
          platform: productData.data.platform,
          image: productData.data.images[0] ?? "/battlefield_6.jpg",
          price: productData.data.price,
          currency: productData.data.currency,
          quantity: 1,
        },
      ];
    }

    if (isDirectTopUpCheckout) {
      return directTopUpOrder?.items ?? [];
    }

    return cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      platform: item.platform,
      image: item.image,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity,
    }));
  }, [cartItems, directTopUpOrder, isDirectTopUpCheckout, productData]);

  const cartKey = JSON.stringify([user?.id, orderItems.map(item => [item.id, item.quantity]), isDirectTopUpCheckout ? topUpSelection : null]);
  const activePayment = preparedPayment?.cartKey === cartKey ? preparedPayment : null;

  // Sync direct topup cache snapshot details
  useEffect(() => {
    if (!isDirectTopUpCheckout) {
      setDirectTopUpOrder(undefined);
      return;
    }

    const snapshot = readCheckoutOrderSnapshot();
    setDirectTopUpOrder(snapshot);
    const selected = snapshot?.items.length === 1 ? findTopUpPackage(snapshot.items[0].id) : null;
    setTopUpSelection(selected ? { gameSlug: selected.game.slug, packageId: selected.item.id, fields: snapshot?.topUp?.fields ?? {} } : null);
    setTopUpDetailsConfirmed(false);
  }, [isDirectTopUpCheckout]);

  // Fetch product data details from Supabase database
  useEffect(() => {
    setIsLoading(true);
    setProductData(null);
    if (!productId) {
      setIsLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            seller:users (
              id,
              display_name,
              avatar_url,
              rating,
              is_verified_seller
            )
          `)
          .eq("id", productId)
          .single();

        if (error || !data) {
          console.error("Failed to fetch product from Supabase:", error);
          return;
        }

        // Map product details with seller credentials
        const mapped = {
          data: {
            id: data.id,
            name: data.title,
            type: data.category,
            platform: data.platform || "PC",
            edition: data.edition || "Standard",
            delivery: data.delivery || "Instant",
            activationRegion: data.region,
            price: Number(data.price),
            currency: data.currency,
            images: [data.image_url || "/cyberpunk_2077.jpg"],
          },
          seller: {
            id: data.seller?.id || "unknown",
            name: data.seller?.display_name || "Unknown Seller",
            avatar: data.seller?.avatar_url || "/avt1.png",
            isOnline: true,
            badge: data.seller?.is_verified_seller ? "Verified Seller" : "Seller",
            tier: "Pro",
            rating: Number(data.seller?.rating || 5),
            successRate: 100,
            totalFeedbacks: 12,
            timezone: "GMT+7",
            totalSales: 10,
            positiveFeedbacks: 12,
            negativeFeedbacks: 0,
          },
        };
        setProductData(mapped);
      } catch (e) {
        console.error("Failed to fetch product:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  // Prices and payment ownership are verified by the application server.
  useEffect(() => {
    setPreparedPayment(null);
    setPaymentError(null);
    setIsPreparing(false);
    if (isLoading || isAuthLoading || !user || orderItems.length === 0) return;
    if (isDirectTopUpCheckout) {
      if (!topUpDetailsConfirmed || !topUpSelection) return;
      try { validateTopUpSelection(topUpSelection); }
      catch { setPaymentError("Please enter valid player details."); return; }
    }
    if (!stripePromise) {
      setPaymentError("Payment service is not configured.");
      return;
    }
    const controller = new AbortController();
    const requestId = requestIds.current.get(cartKey) ?? crypto.randomUUID();
    requestIds.current.set(cartKey, requestId);
    setIsPreparing(true);
    async function preparePayment() {
      try {
        const data = await paymentRequest<Omit<PreparedPayment, "cartKey">>("/api/create-payment-intent", {
          requestId, ...(isDirectTopUpCheckout ? { topUp: topUpSelection } : { items: orderItems.map(({ id, quantity }) => ({ id, quantity })) }),
        }, controller.signal);
        if (!controller.signal.aborted) setPreparedPayment({ ...data, cartKey });
      } catch (error) {
        if (!controller.signal.aborted) setPaymentError(error instanceof Error ? error.message : "Unable to prepare payment.");
      } finally {
        if (!controller.signal.aborted) setIsPreparing(false);
      }
    }
    void preparePayment();
    return () => controller.abort();
  }, [cartKey, orderItems, isLoading, isAuthLoading, user, isDirectTopUpCheckout, stripePromise, retry, topUpSelection, topUpDetailsConfirmed]);

  // Loading indicator overlay boundary
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pt-8 lg:flex-row lg:items-start">
      
      {/* ==========================================
         RIGHT COLUMN (Mobile: Top, Desktop: Right)
         ========================================== */}
      <div className="order-1 flex w-full flex-col gap-6 lg:order-2 lg:w-[32%]">
        {/* Product details and Cart summary */}
        <CheckoutOrderSummary
          productData={productData}
          orderItems={activePayment?.items ?? orderItems}
          isDirectTopUpCheckout={isDirectTopUpCheckout}
        />

        {/* Checkout Billing Total details */}
        <CheckoutTotalCard amount={activePayment?.amount ?? amount} />
      </div>

      {/* ==========================================
         LEFT COLUMN (Mobile: Bottom, Desktop: Left)
         ========================================== */}
      <div className="order-2 w-full space-y-4 lg:order-1 lg:w-[68%]">
        {/* Search bar and Country selections */}
        <PaymentFilters />

        {/* Currency Mismatch Warning Banner */}
        <CurrencyWarningBanner />

        {/* Active Payment Elements Forms (Loaded once keys sync up) */}
        <div className="space-y-3">
          {isDirectTopUpCheckout && topUpSelection && (() => {
            const selected = findTopUpPackage(topUpSelection.packageId);
            if (!selected) return null;
            return <form className="space-y-4 rounded-lg border border-[#30363d] bg-midnight-750 p-5" onSubmit={event => {
              event.preventDefault();
              setTopUpDetailsConfirmed(true);
            }}>
              <h2 className="text-lg font-semibold text-white">Player details</h2>
              <p className="text-sm text-slate-400">Confirm the account for {selected.game.title}. Region: {selected.game.regionLabel}.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {selected.game.inputs.map(field => <label key={field.id} className="space-y-2 text-sm text-slate-300">
                  <span>{field.label}</span>
                  <input required maxLength={100} value={topUpSelection.fields[field.id] ?? ""} placeholder={field.placeholder}
                    onChange={event => { setTopUpDetailsConfirmed(false); setTopUpSelection(current => current ? { ...current, fields: { ...current.fields, [field.id]: event.target.value } } : null); }}
                    className="w-full rounded-lg bg-midnight-650 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-dm-accent-green" />
                </label>)}
              </div>
              <p className="text-sm text-amber-200">Test payment only. No in-game currency will be delivered.</p>
              {!topUpDetailsConfirmed && <button type="submit" className="rounded-lg bg-dm-accent-green px-5 py-3 font-semibold text-white">Continue to payment</button>}
            </form>;
          })()}
          {isDirectTopUpCheckout && directTopUpOrder !== undefined && !topUpSelection && <p role="alert" className="text-slate-300">Choose a top-up package on the Direct Top-Up page to continue.</p>}
          {!isAuthLoading && !user && (
            <div className="rounded-lg bg-[#1f2937] p-5 text-white">
              <p>Please sign in before paying.</p>
              <SignIn />
            </div>
          )}
          {!isLoading && orderItems.length === 0 && <p role="alert" className="text-slate-300">No products available for checkout.</p>}
          {isPreparing && <p role="status" className="text-slate-300">Preparing secure payment…</p>}
          {paymentError && <div role="alert" className="rounded-lg bg-red-500/10 p-4 text-red-300">
            <p>{paymentError}</p>
            <button className="mt-2 cursor-pointer underline" onClick={() => setRetry(value => value + 1)}>Retry</button>
          </div>}
          {activePayment && stripePromise && (
            <Elements
              key={activePayment.clientSecret}
              options={{
                clientSecret: activePayment.clientSecret,
                appearance: {
                  theme: "night",
                  labels: "floating",
                  variables: {
                    fontFamily:
                      "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
                  },
                },
                fonts: [],
              }}
              stripe={stripePromise}
            >
              <CheckoutForm amount={activePayment.amount} orderItems={activePayment.items} clientSecret={activePayment.clientSecret} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}


