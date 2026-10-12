import { createHmac, webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({ record: vi.fn() }));
vi.mock("@/lib/payments/server", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/payments/server")>();
  return { ...original, recordPaidOrder: mocks.record };
});

const secret = "whsec_workers_test";
const event = { id: "evt_workers_test", type: "payment_intent.succeeded", data: { object: {
  id: "pi_workers_test", metadata: { app: "difmark-test-checkout-v1" },
} } };
function request(payload = JSON.stringify(event), signingSecret = secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", signingSecret).update(`${timestamp}.${payload}`).digest("hex");
  return new Request("https://example.com/api/payments/webhook", { method: "POST", body: payload,
    headers: { "stripe-signature": `t=${timestamp},v1=${signature}` },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_workers");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", secret);
  vi.stubGlobal("crypto", webcrypto);
  mocks.record.mockResolvedValue({});
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("Workers webhook signature verification", () => {
  it("verifies the raw Stripe signature with Web Crypto and records the payment", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(mocks.record).toHaveBeenCalledWith(event.data.object);
  });
  it("rejects a forged signature without recording an order", async () => {
    const response = await POST(request(JSON.stringify(event), "whsec_wrong"));
    expect(response.status).toBe(400);
    expect(mocks.record).not.toHaveBeenCalled();
  });
  it("rejects an unsigned payload", async () => {
    const response = await POST(new Request("https://example.com/api/payments/webhook", { method: "POST", body: JSON.stringify(event) }));
    expect(response.status).toBe(400);
    expect(mocks.record).not.toHaveBeenCalled();
  });
  it("accepts other signed events without treating them as paid orders", async () => {
    const response = await POST(request(JSON.stringify({ ...event, type: "payment_intent.created" })));
    expect(response.status).toBe(200);
    expect(mocks.record).not.toHaveBeenCalled();
  });
});
