import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import messages from "@/messages/en.json";
import CheckoutForm from "./CheckoutForm";

const mocks = vi.hoisted(() => ({ submit: vi.fn(), confirmPayment: vi.fn(), confirmCardPayment: vi.fn(), snapshot: vi.fn() }));
vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: () => ({ confirmPayment: mocks.confirmPayment, confirmCardPayment: mocks.confirmCardPayment }),
  useElements: () => ({ submit: mocks.submit }),
  PaymentElement: () => <div>Manual card fields</div>,
}));
vi.mock("./checkout-session", () => ({ saveCheckoutOrderSnapshot: mocks.snapshot }));

const renderForm = () => render(<NextIntlClientProvider locale="en" messages={messages}>
  <CheckoutForm clientSecret="pi_test_secret" amount={25.99} orderItems={[]} />
</NextIntlClientProvider>);
const pay = () => fireEvent.click(screen.getByRole("button", { name: "Pay $25.99" }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_mock");
  mocks.submit.mockResolvedValue({});
  const failure = { error: { type: "card_error", message: "Test payment declined" } };
  mocks.confirmCardPayment.mockResolvedValue(failure);
  mocks.confirmPayment.mockResolvedValue(failure);
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("checkout test card shortcut", () => {
  it("selects the test card without making a payment until Pay is clicked", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Use test card" }));
    expect(screen.getByRole("status")).toHaveTextContent("Test card selected");
    expect(screen.queryByText("Manual card fields")).not.toBeInTheDocument();
    expect(mocks.confirmCardPayment).not.toHaveBeenCalled();
    pay();
    await screen.findByRole("alert");
    expect(mocks.confirmCardPayment).toHaveBeenCalledWith("pi_test_secret", { payment_method: "pm_card_visa" });
    expect(mocks.submit).not.toHaveBeenCalled();
    expect(mocks.snapshot).toHaveBeenCalled();
  });

  it("restores normal card entry and Stripe validation when switching back", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Use test card" }));
    fireEvent.click(screen.getByRole("button", { name: "Enter card manually" }));
    expect(screen.getByText("Manual card fields")).toBeInTheDocument();
    pay();
    await screen.findByRole("alert");
    expect(mocks.submit).toHaveBeenCalledOnce();
    expect(mocks.confirmPayment).toHaveBeenCalledOnce();
    expect(mocks.confirmCardPayment).not.toHaveBeenCalled();
  });

  it("keeps invalid manual card details from confirming a payment", async () => {
    mocks.submit.mockResolvedValue({ error: { message: "Card details incomplete" } });
    renderForm();
    pay();
    expect(await screen.findByRole("alert")).toHaveTextContent("Card details incomplete");
    expect(mocks.confirmPayment).not.toHaveBeenCalled();
    expect(mocks.snapshot).not.toHaveBeenCalled();
  });

  it("prevents duplicate submissions and allows retry after a Stripe error", async () => {
    let resolve!: (value: unknown) => void;
    mocks.confirmCardPayment.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Use test card" }));
    pay();
    fireEvent.submit(document.getElementById("payment-form")!);
    expect(mocks.confirmCardPayment).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Enter card manually" })).toBeDisabled();
    resolve({ error: { type: "card_error", message: "Test payment declined" } });
    await screen.findByRole("alert");
    await waitFor(() => expect(screen.getByRole("button", { name: "Pay $25.99" })).toBeEnabled());
    pay();
    await waitFor(() => expect(mocks.confirmCardPayment).toHaveBeenCalledTimes(2));
  });

  it.each(["pk_live_mock", ""])("does not offer a test card for key %s", key => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", key);
    renderForm();
    expect(screen.queryByRole("button", { name: "Use test card" })).not.toBeInTheDocument();
    expect(screen.getByText("Manual card fields")).toBeInTheDocument();
  });
});
