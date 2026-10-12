import React, { Suspense } from "react";
import NavBar from "@/components/layout/NavBar";
import { AppProviders } from "@/contexts/AppProviders";
import { CheckoutPaymentStatusProvider } from "@/components/checkout/CheckoutPaymentStatus";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <CheckoutPaymentStatusProvider>
        <div className="min-h-screen bg-midnight-850 font-sans text-slate-200">
          <Suspense fallback={<div className="h-16 w-full bg-transparent" />}>
            <NavBar />
          </Suspense>
          <div className="flex flex-1 flex-col items-center pt-16 w-full overflow-x-hidden">
            {children}
          </div>
          {/* No Footer here as per implementation plan for checkout */}
        </div>
      </CheckoutPaymentStatusProvider>
    </AppProviders>
  );
}
