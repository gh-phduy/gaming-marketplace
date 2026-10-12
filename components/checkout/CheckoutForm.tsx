"use client";

import { useState, useRef } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import {
  saveCheckoutOrderSnapshot,
  type CheckoutOrderItem,
} from "./checkout-session";

/* ==========================================================================
   MAIN COMPONENT: CheckoutForm
   ========================================================================== */

/**
 * CheckoutForm Component
 *
 * Renders the Stripe payment element forms. Handles Stripe client instance bindings,
 * order caching snapshot setups, payment confirmations, and error state tracking.
 */
export default function CheckoutForm({
  amount,
  orderItems,
}: {
  amount: number;
  orderItems: CheckoutOrderItem[];
}) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const submitting = useRef(false);

  /**
   * Submit transaction processing handler.
   * Backups cart items in sessionStorage first to bridge Stripe redirects.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || submitting.current) {
      return;
    }

    submitting.current = true;
    setIsLoading(true);
    setMessage(null);
    try {
      // Trigger form validation and wallet collection IMMEDIATELY
      // to preserve the trusted user gesture required by mobile browsers
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setMessage(submitError.message ?? t("unexpectedError"));
        submitting.current = false;
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const currency = orderItems[0]?.currency ?? "$";

      // Cache order details in sessionStorage prior to redirecting to Stripe
      saveCheckoutOrderSnapshot({
        items: orderItems,
        subtotal: amount,
        total: amount,
        currency,
        createdAt: new Date().toISOString(),
      });

      // Request payment validation and redirection
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Capture and translate Stripe processing issues
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message ?? t("unexpectedError"));
        } else {
          setMessage(t("unexpectedError"));
        }
        setIsLoading(false);
        submitting.current = false;
      } else if (paymentIntent) {
        // Fallback for when redirect: "if_required" resolves directly
        // Manually navigate the user to the success page with required params
        const status = paymentIntent.status === "succeeded" ? "succeeded" : paymentIntent.status;
        window.location.href = `/${locale}/checkout/success?payment_intent=${paymentIntent.id}&redirect_status=${status}`;
      } else {
        setMessage(t("unexpectedError"));
        submitting.current = false;
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error("Payment submission crashed:", err);
      setMessage(err instanceof Error ? err.message : t("unexpectedError"));
      setIsLoading(false);
      submitting.current = false;
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Test Mode Info Callout for Recruiters/Testers */}
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-300 flex flex-col gap-y-1">
        <span className="font-semibold flex items-center gap-x-1">
          {t("stripeTestPaymentMode")}
        </span>
        <p className="text-gray-300">
          {t("useCard")} <code className="bg-yellow-500/20 px-1.5 py-0.5 rounded text-yellow-200 font-mono font-bold">4242 4242 4242 4242</code>
        </p>
        <p className="text-gray-400 text-xs">
          {t("expiryCvcZip")}
        </p>
      </div>

      {/* Stripe Payment Element (Loads dynamic input tabs per country/intent settings) */}
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      
      {/* Submit Button Trigger */}
      <Button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full rounded bg-[#eac54f] py-6 text-base font-bold text-[#161b22] shadow-none transition-colors hover:bg-[#d4b246]"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="spinner" id="spinner">
              {t("processingDots")}
            </div>
          ) : (
            `${t("pay")} $${amount}`
          )}
        </span>
      </Button>
      
      {/* Error & Warning Message Area */}
      {message && (
        <div
          id="payment-message"
          className="p-4 text-center text-sm text-red-500"
        >
          {message}
        </div>
      )}
    </form>
  );
}
