import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { paymentRequest } from "./client";

const mocks = vi.hoisted(() => ({ session: vi.fn(), fetch: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { auth: { getSession: mocks.session } } }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.session.mockResolvedValue({ data: { session: { access_token: "test-session-token" } } });
  vi.stubGlobal("fetch", mocks.fetch);
});
afterEach(() => vi.unstubAllGlobals());

describe("payment API responses", () => {
  it("sends the authenticated request and returns the server payment", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ amount: 25.99, clientSecret: "test-secret" }));
    await expect(paymentRequest("/api/create-payment-intent", { items: [] })).resolves.toEqual({ amount: 25.99, clientSecret: "test-secret" });
    expect(mocks.fetch).toHaveBeenCalledWith("/api/create-payment-intent", expect.objectContaining({
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer test-session-token" },
      body: JSON.stringify({ items: [] }),
    }));
  });
  it("shows a retryable error when the Worker returns an HTML error page", async () => {
    mocks.fetch.mockResolvedValue(new Response("<!DOCTYPE html><html>Worker error</html>", { status: 500 }));
    await expect(paymentRequest("/api/create-payment-intent", {})).rejects.toThrow("Payment service unavailable (HTTP 500). Please try again.");
  });
  it("preserves a validation error from the server", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ error: "Insufficient stock." }, { status: 400 }));
    await expect(paymentRequest("/api/create-payment-intent", {})).rejects.toThrow("Insufficient stock.");
  });
  it("rejects a non-JSON success response", async () => {
    mocks.fetch.mockResolvedValue(new Response("<!DOCTYPE html><html>Unexpected page</html>"));
    await expect(paymentRequest("/api/create-payment-intent", {})).rejects.toThrow("unexpected response");
  });
  it("does not send a payment request without a session", async () => {
    mocks.session.mockResolvedValue({ data: { session: null } });
    await expect(paymentRequest("/api/create-payment-intent", {})).rejects.toThrow("Please sign in to pay.");
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("passes cancellation to fetch", async () => {
    const controller = new AbortController();
    const aborted = new DOMException("Aborted", "AbortError");
    mocks.fetch.mockRejectedValue(aborted);
    await expect(paymentRequest("/api/create-payment-intent", {}, controller.signal)).rejects.toBe(aborted);
    expect(mocks.fetch).toHaveBeenCalledWith("/api/create-payment-intent", expect.objectContaining({ signal: controller.signal }));
  });
});
