"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type VerifiedPaymentStatus = {
  paymentIntent: string;
  status: "processing" | "succeeded" | "failed";
};

const CheckoutPaymentStatusContext = createContext<{
  result: VerifiedPaymentStatus | null;
  setResult: (result: VerifiedPaymentStatus | null) => void;
} | null>(null);

export function CheckoutPaymentStatusProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<VerifiedPaymentStatus | null>(null);
  const value = useMemo(() => ({ result, setResult }), [result]);
  return <CheckoutPaymentStatusContext.Provider value={value}>{children}</CheckoutPaymentStatusContext.Provider>;
}

export function useCheckoutPaymentStatus() {
  const value = useContext(CheckoutPaymentStatusContext);
  if (!value) throw new Error("CheckoutPaymentStatusProvider is required.");
  return value;
}

export function getCheckoutProgress(pathname: string | null, paymentIntent: string | null, result: VerifiedPaymentStatus | null) {
  const isSuccessPage = /\/checkout\/success\/?$/.test(pathname ?? "");
  const verifiedStatus = isSuccessPage && paymentIntent && result?.paymentIntent === paymentIntent ? result.status : "processing";
  return { isCompleted: verifiedStatus === "succeeded", isFailed: verifiedStatus === "failed" };
}
