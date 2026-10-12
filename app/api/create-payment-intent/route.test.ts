import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { PaymentError } from "@/lib/payments/server";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/payments/server", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/payments/server")>(),
  authenticatePaymentRequest: mocks.auth, createCheckoutPayment: mocks.create,
}));
describe("authenticated checkout endpoint", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({client:{}, user:{id:"buyer"}}); });
  it("rejects requests without a valid session", async () => {
    mocks.auth.mockRejectedValue(new PaymentError("Please sign in to pay.", 401));
    const response = await POST(new Request("http://localhost/api/create-payment-intent", {method:"POST"}));
    expect(response.status).toBe(401); expect(mocks.create).not.toHaveBeenCalled();
  });
  it("passes cart identifiers to server pricing and disables response caching", async () => {
    const cart = { requestId:"request", items:[{id:"product",quantity:2}] };
    mocks.create.mockResolvedValue({clientSecret:"test-secret",amount:79.98});
    const response = await POST(new Request("http://localhost/api/create-payment-intent", {method:"POST",body:JSON.stringify(cart)}));
    expect(mocks.create).toHaveBeenCalledWith({},"buyer",cart);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect((await response.json()).amount).toBe(79.98);
  });
});
