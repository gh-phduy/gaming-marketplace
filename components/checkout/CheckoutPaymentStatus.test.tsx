import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutPaymentStatusProvider, getCheckoutProgress } from "./CheckoutPaymentStatus";
import CheckoutNavSection from "@/components/layout/nav/CheckoutNavSection";
import { useSuccessCheckout } from "@/app/[locale]/(checkout)/checkout/success/_components/useSuccessCheckout";
import { readMarketplaceNotifications } from "@/components/notifications/notification-store";

const mocks = vi.hoisted(() => ({ request: vi.fn(), resetCart: vi.fn(), query: "payment_intent=pi_paid", user: { id: "buyer" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/checkout/success",
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock("@/lib/payments/client", () => ({ paymentRequest: mocks.request }));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ resetCart: mocks.resetCart }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: mocks.user, isLoading: false }) }));

const snapshot = { items: [{id:"product",name:"Control Resonant",platform:"PC",image:"/game.jpg",price:29.99,currency:"USD",quantity:1}],
  subtotal:29.99,total:29.99,currency:"USD",createdAt:"2026-10-12T00:00:00Z" };
function Result() {
  const { status } = useSuccessCheckout();
  return <output aria-label="Verified result">{status ?? "verifying"}</output>;
}
function setup() {
  return render(<CheckoutPaymentStatusProvider><CheckoutNavSection /><Result /></CheckoutPaymentStatusProvider>);
}
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear(); mocks.query="payment_intent=pi_paid"; });
afterEach(cleanup);

describe("reopening a payment notification", () => {
  it("shows Processing while verifying, then Completed without redirect_status", async () => {
    let finish!: (result: unknown) => void;
    mocks.request.mockReturnValue(new Promise(resolve => { finish=resolve; }));
    setup();
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.queryByText("Failed")).not.toBeInTheDocument();
    await act(async () => { finish({status:"succeeded",recorded:true,snapshot}); });
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByLabelText("Verified result")).toHaveTextContent("succeeded");
    expect(readMarketplaceNotifications("buyer")[0].href).toBe("/checkout/success?payment_intent=pi_paid");
    expect(mocks.resetCart).toHaveBeenCalledTimes(1);
  });

  it("does not trust a forged succeeded URL when Stripe reports unpaid", async () => {
    mocks.query="payment_intent=pi_unpaid&redirect_status=succeeded";
    mocks.request.mockResolvedValue({status:"requires_payment_method",recorded:false});
    setup();
    await waitFor(() => expect(screen.getByText("Failed")).toBeInTheDocument());
    expect(screen.getByLabelText("Verified result")).toHaveTextContent("failed");
    expect(mocks.resetCart).not.toHaveBeenCalled();
    expect(readMarketplaceNotifications("buyer")).toEqual([]);
  });

  it("ignores an obsolete failed URL and does not clear a new cart when reopening an already processed order", async () => {
    mocks.query="payment_intent=pi_paid&redirect_status=failed";
    localStorage.setItem("processed_payment_intent:buyer","pi_paid");
    mocks.request.mockResolvedValue({status:"succeeded",recorded:true,snapshot});
    setup();
    await waitFor(() => expect(screen.getByText("Completed")).toBeInTheDocument());
    expect(mocks.resetCart).not.toHaveBeenCalled();
    expect(mocks.request).toHaveBeenCalledWith("/api/payments/verify",{paymentIntent:"pi_paid"},expect.any(AbortSignal));
  });

  it("does not reuse a previous payment status for another payment or checkout route", () => {
    const previous = {paymentIntent:"pi_old",status:"succeeded" as const};
    expect(getCheckoutProgress("/en/checkout/success","pi_new",previous)).toEqual({isCompleted:false,isFailed:false});
    expect(getCheckoutProgress("/en/checkout","pi_old",previous)).toEqual({isCompleted:false,isFailed:false});
  });
});
