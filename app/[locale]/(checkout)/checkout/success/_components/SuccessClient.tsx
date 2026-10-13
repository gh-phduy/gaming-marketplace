"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Home,
  Loader2,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSuccessCheckout,
  formatCurrency,
  truncatePaymentId,
} from "./useSuccessCheckout";
import { SuccessToast } from "./SuccessCheckoutComponents";

export default function SuccessClient() {
  const {
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
  } = useSuccessCheckout();

  if (status === null) {
    return (
      <main className="relative mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#1f2937] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="border-b border-white/[0.06] bg-[linear-gradient(135deg,rgba(98,214,118,0.16),rgba(31,41,55,0.3)_42%,rgba(51,65,85,0.38))] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 gap-5">
                <Skeleton className="h-16 w-16 shrink-0 rounded-lg bg-[#62d676]/20" />
                <div className="min-w-0 flex flex-col justify-center space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/20" />
                  <Skeleton className="h-8 w-64 bg-white/20" />
                  <Skeleton className="mt-1 h-4 w-80 hidden bg-white/10 sm:block" />
                </div>
              </div>
              <div className="space-y-2 rounded-lg border border-white/[0.06] bg-[#151c26]/70 p-4 lg:min-w-[260px]">
                <Skeleton className="h-4 w-24 bg-white/20" />
                <Skeleton className="h-8 w-32 bg-white/20" />
                <Skeleton className="h-4 w-20 bg-white/10" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-7 w-40 bg-white/20" />
                <Skeleton className="h-6 w-24 rounded-full bg-[#62d676]/20" />
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-lg border border-white/[0.05] bg-[#151c26]/80 p-3"
                  >
                    <Skeleton className="h-24 w-36 shrink-0 rounded-md bg-[#0f1722]/50" />
                    <div className="flex min-w-0 flex-1 flex-col justify-center space-y-2">
                      <Skeleton className="h-5 w-48 bg-white/20" />
                      <Skeleton className="h-4 w-24 bg-white/10" />
                      <div className="mt-2 flex gap-3">
                        <Skeleton className="h-7 w-24 bg-white/10" />
                        <Skeleton className="h-6 w-16 bg-white/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="space-y-4 rounded-lg border border-white/[0.06] bg-[#151c26]/80 p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 bg-[#62d676]/20" />
                  <Skeleton className="h-6 w-32 bg-white/20" />
                </div>
                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-10 w-full rounded-md bg-[#222c3b]" />
                  </div>
                  <div className="flex justify-between border-t border-white/[0.06] pt-4">
                    <Skeleton className="h-4 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-20 bg-[#62d676]/20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-16 bg-white/20" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-white/[0.06] bg-[#151c26]/80 p-5">
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-5 rounded-full bg-[#62d676]/20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32 bg-white/20" />
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-2/3 bg-white/10" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-5 w-5 rounded-full bg-[#62d676]/20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32 bg-white/20" />
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-2/3 bg-white/10" />
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Skeleton className="h-12 w-full rounded-md bg-[#62d676]/20" />
                <Skeleton className="h-12 w-full rounded-md bg-white/10" />
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  if (status === "failed") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[880px] items-center justify-center px-4 py-12">
        <div className="w-full rounded-lg border border-red-500/20 bg-[#1f2937] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="h-11 w-11 text-red-400" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white">
            Payment could not be completed
          </h1>
          <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-slate-300">
            We could not confirm this payment. Your cart has not been cleared,
            so you can review the order and try again securely.
          </p>
          {dbError && <p role="alert" className="mt-3 text-sm text-red-300">{dbError}</p>}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-md bg-[#62d676] px-6 font-bold text-[#111827] hover:bg-[#56c96a]"
            >
              <Link href="/checkout">Return to checkout</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="h-12 rounded-md bg-[#303a4a] px-6 font-semibold text-white hover:bg-[#3a4658]"
            >
              <Link href="/">Back to marketplace</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
      <SuccessToast
        isVisible={showToast}
        itemCount={displayedItemCount}
        total={formattedTotal}
      />

      {dbError && (
        <div className="mb-6 rounded-lg border border-yellow-500/20 bg-[#2b2b1d] p-6 text-yellow-400 shadow-md">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-yellow-500" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">Payment succeeded, but system sync failed</h3>
              <p className="mt-1 text-sm text-gray-300">
                Your payment was processed successfully by Stripe, but we couldn&apos;t record the transaction in our database.
              </p>
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => void saveOrderToDb()}
                  disabled={isSyncing}
                  className="h-9 rounded bg-[#62d676] px-4 text-xs font-bold text-[#111827] hover:bg-[#56c96a] disabled:opacity-50"
                >
                  {isSyncing ? "Syncing..." : "Retry System Sync"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#1f2937] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="border-b border-white/[0.06] bg-[linear-gradient(135deg,rgba(98,214,118,0.16),rgba(31,41,55,0.3)_42%,rgba(51,65,85,0.38))] px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[#62d676]/25 bg-[#62d676]/12">
                <CheckCircle2 className="h-9 w-9 text-[#62d676]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-wide text-[#62d676] uppercase">
                  Payment confirmed
                </p>
                <h1 className="mt-2 text-3xl leading-tight font-bold text-white sm:text-4xl">
                  {dbError ? "Your test payment is confirmed" : "Your test order is recorded"}
                </h1>
                <p className="mt-3 max-w-[680px] text-sm leading-6 text-slate-300">
                  {dbError ? "Payment is confirmed; order recording needs a retry. " : "Your Stripe test payment is confirmed and recorded. "}
                  No real money was charged and no game key is delivered in this test checkout.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-[#151c26]/70 p-4 lg:min-w-[260px]">
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Total paid
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {formattedTotal}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {displayedItemCount}{" "}
                {displayedItemCount === 1 ? "product" : "products"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Purchased items</h2>
              <span className="rounded-full bg-[#62d676]/12 px-3 py-1 text-xs font-semibold text-[#62d676]">
                Paid successfully
              </span>
            </div>

            {orderSnapshot?.items.length ? (
              <div className="space-y-3">
                {orderSnapshot.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-white/[0.05] bg-[#151c26]/80 p-3"
                  >
                    <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-md bg-[#0f1722]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={144}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <h3 className="truncate text-base font-bold text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.platform}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="rounded bg-[#263241] px-2.5 py-1 text-slate-300">
                          Quantity: {item.quantity}
                        </span>
                        <span className="font-semibold text-white">
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 rounded-lg border border-[#eac54f]/20 bg-[#eac54f]/8 p-4 text-sm leading-6 text-slate-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#eac54f]" />
                <p>
                  Payment was confirmed, but the local order snapshot is no
                  longer available in this browser session. You can still use
                  the payment reference below for support.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-white/[0.06] bg-[#151c26]/80 p-5">
              <div className="flex items-center gap-3">
                <ReceiptText className="h-5 w-5 text-[#62d676]" />
                <h2 className="font-bold text-white">Payment details</h2>
              </div>
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-slate-400">Payment ID</p>
                  <div className="mt-1 flex items-center justify-between gap-3 rounded-md bg-[#222c3b] px-3 py-2">
                    <span className="truncate font-mono text-xs text-white">
                      {truncatePaymentId(paymentIntent)}
                    </span>
                    <Copy className="h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                </div>
                <div className="flex justify-between border-t border-white/[0.06] pt-4">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold text-[#62d676]">Succeeded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery</span>
                  <span className="font-semibold text-white">Test mode</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-[#151c26]/80 p-5">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[#62d676]" />
                  <div>
                    <p className="font-semibold text-white">Test transaction</p>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      No real money was charged for this test order.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5 text-[#62d676]" />
                  <div>
                    <p className="font-semibold text-white">Next step</p>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      Review the recorded test order in your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <Button
                asChild
                className="h-12 rounded-md bg-[#62d676] font-bold text-[#111827] hover:bg-[#56c96a]"
              >
                <Link href="/product">
                  Continue shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="h-12 rounded-md bg-[#303a4a] font-semibold text-white hover:bg-[#3a4658]"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to home
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {showToast ? (
        <button
          type="button"
          aria-label="Dismiss payment notification"
          onClick={() => setShowToast(false)}
          className="fixed top-[104px] right-7 z-[60] hidden h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white sm:flex"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </main>
  );
}
