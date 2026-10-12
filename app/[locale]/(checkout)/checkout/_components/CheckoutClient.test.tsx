import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import CheckoutClient from "./CheckoutClient";

const mocks = vi.hoisted(() => ({ snapshot: null as unknown, pay: vi.fn(), user: { id: "buyer" }, cartItems: [{ id: "unrelated-cart-game", price: 99, quantity: 1 }] }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("directTopUp=1") }));
vi.mock("@/lib/supabase", () => ({ supabase: {} }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: mocks.user, isLoading: false }) }));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ cartItems: mocks.cartItems }) }));
vi.mock("@/components/checkout/checkout-session", () => ({ readCheckoutOrderSnapshot: () => mocks.snapshot }));
vi.mock("@/lib/payments/client", () => ({ paymentRequest: mocks.pay }));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: () => Promise.resolve({}) }));
vi.mock("@stripe/react-stripe-js", () => ({ Elements: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/checkout/CheckoutForm", () => ({ default: () => <div>Card payment form</div> }));
vi.mock("./PaymentFilters", () => ({ PaymentFilters: () => null }));
vi.mock("./CurrencyWarningBanner", () => ({ CurrencyWarningBanner: () => null }));
vi.mock("./CheckoutTotalCard", () => ({ CheckoutTotalCard: ({ amount }: { amount: number }) => <div>Total: {amount}</div> }));
vi.mock("./CheckoutOrderSummary", () => ({ CheckoutOrderSummary: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_mock");
  mocks.snapshot = { items: [{ id: "pubg-60-uc", price: 1.18, quantity: 1 }], total: 1.18 };
  mocks.pay.mockResolvedValue({ clientSecret: "secret", amount: 1.18, items: [] });
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("direct top-up checkout", () => {
  it("collects missing details from older snapshots before preparing payment", async () => {
    render(<CheckoutClient />);
    const uid = await screen.findByRole("textbox", { name: "Player UID" });
    expect(mocks.pay).not.toHaveBeenCalled();
    fireEvent.change(uid, { target: { value: "512345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
    await screen.findByText("Card payment form");
    expect(mocks.pay.mock.calls[0][1]).toMatchObject({ topUp: {
      gameSlug: "pubg-mobile", packageId: "pubg-60-uc", fields: { uid: "512345678" },
    } });
    expect(mocks.pay.mock.calls[0][1]).not.toHaveProperty("items");
  });
  it("does not fall back to an unrelated cart when the top-up snapshot is absent", async () => {
    mocks.snapshot = null;
    render(<CheckoutClient />);
    await screen.findByText("Choose a top-up package on the Direct Top-Up page to continue.");
    expect(screen.getByText("Total: 0")).toBeInTheDocument();
    expect(mocks.pay).not.toHaveBeenCalled();
  });
  it("invalidates a prepared payment when the recipient changes", async () => {
    render(<CheckoutClient />);
    const uid = await screen.findByRole("textbox", { name: "Player UID" });
    fireEvent.change(uid, { target: { value: "512345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
    await screen.findByText("Card payment form");
    fireEvent.change(uid, { target: { value: "598765432" } });
    await waitFor(() => expect(screen.queryByText("Card payment form")).not.toBeInTheDocument());
    expect(mocks.pay).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
    await waitFor(() => expect(mocks.pay).toHaveBeenCalledTimes(2));
    expect(mocks.pay.mock.calls[0][1].requestId).not.toEqual(mocks.pay.mock.calls[1][1].requestId);
  });
});
