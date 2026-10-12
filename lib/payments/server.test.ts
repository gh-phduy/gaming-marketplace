import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticatePaymentRequest, createCheckoutPayment, readPaidLines, recordPaidOrder, verifyCheckoutPayment } from "./server";

const mocks = vi.hoisted(() => ({ create: vi.fn(), retrieve: vi.fn(), db: vi.fn(), auth: vi.fn(), rows: vi.fn() }));
vi.mock("stripe", () => ({ default: class { paymentIntents = { create: mocks.create, retrieve: mocks.retrieve }; } }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ auth: { getUser: mocks.auth }, from: mocks.db }) }));
const product = "10000000-0000-4000-8000-000000000001";
const buyer = "20000000-0000-4000-8000-000000000001";
const requestId = "30000000-0000-4000-8000-000000000001";
let products: Record<string, unknown>[];
function intent(overrides: Record<string, unknown> = {}) {
  return { id: "pi_test123", status: "succeeded", amount: 3999, amount_received: 3999, currency: "usd", livemode: false,
    created: 1800000000, metadata: { app: "difmark-test-checkout-v1", buyer_id: buyer, item_count: "1", item_0: JSON.stringify([product,1,3999]) },
    ...overrides } as unknown as Stripe.PaymentIntent;
}
beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "backend";
  products = [{id:product,title:"Game",price:39.99,currency:"USD",stock:10,platform:"PC",image_url:"/game.jpg"}];
  mocks.create.mockResolvedValue({client_secret:"test-secret"});
  mocks.retrieve.mockResolvedValue(intent());
  mocks.rows.mockResolvedValue({error:null});
  mocks.auth.mockResolvedValue({data:{user:{id:buyer}},error:null});
  mocks.db.mockImplementation((table: string) => {
    const query = { select: () => query, in: () => query, eq: () => Promise.resolve({data:products,error:null}),
      then: (resolve: (v:unknown)=>unknown) => Promise.resolve({data:products,error:null}).then(resolve), upsert: mocks.rows };
    expect(["products","orders"]).toContain(table);
    return query;
  });
});
const client = {from:mocks.db} as unknown as SupabaseClient;
describe("server-priced payments", () => {
  it("ignores browser-supplied price and amount", async () => {
    const result = await createCheckoutPayment(client,buyer,{requestId,amount:1,items:[{id:product,quantity:2,price:0.01}]});
    expect(result.amount).toBe(79.98);
    expect(mocks.create.mock.calls[0][0].amount).toBe(7998);
    expect(mocks.create.mock.calls[0][0].metadata.buyer_id).toBe(buyer);
  });
  it("uses the same idempotency key on retry", async () => {
    const cart = {requestId,items:[{id:product,quantity:1}]};
    await createCheckoutPayment(client,buyer,cart); await createCheckoutPayment(client,buyer,cart);
    expect(mocks.create.mock.calls[0][1]).toEqual(mocks.create.mock.calls[1][1]);
  });
  it("rejects insufficient stock including duplicate lines", async () => {
    await expect(createCheckoutPayment(client,buyer,{requestId,items:[{id:product,quantity:6},{id:product,quantity:6}]})).rejects.toThrow("stock");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it.each([0,-1,1.5,101])("rejects quantity %s", async quantity => {
    await expect(createCheckoutPayment(client,buyer,{requestId,items:[{id:product,quantity}]})).rejects.toThrow();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects unavailable or non-USD products", async () => {
    products=[];
    await expect(createCheckoutPayment(client,buyer,{requestId,items:[{id:product,quantity:1}]})).rejects.toThrow("available");
    products=[{id:product,price:10,currency:"EUR",stock:10}];
    await expect(createCheckoutPayment(client,buyer,{requestId,items:[{id:product,quantity:1}]})).rejects.toThrow("USD");
  });
  it("refuses live keys and unconfigured order recording", async () => {
    process.env.STRIPE_SECRET_KEY="sk_live_not_allowed";
    await expect(createCheckoutPayment(client,buyer,{requestId,items:[{id:product,quantity:1}]})).rejects.toThrow("test mode");
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(createCheckoutPayment(client,buyer,{requestId,items:[{id:product,quantity:1}]})).rejects.toThrow("recording");
  });
});
describe("direct top-up payments", () => {
  const topUp = { gameSlug: "pubg-mobile", packageId: "pubg-60-uc", fields: { uid: "512345678" } };
  const checkout = { requestId, topUp };
  function topUpIntent() {
    return intent({ amount: 118, amount_received: 118, metadata: {
      app: "difmark-test-checkout-v1", buyer_id: buyer, order_type: "topup", item_count: "1",
      item_0: JSON.stringify(["pubg-60-uc", 1, 118]), topup_game: "pubg-mobile",
      topup_fields: JSON.stringify(topUp.fields), topup_region: "Global",
    } });
  }
  it("prices the package on the server and binds player details to the payment", async () => {
    const result = await createCheckoutPayment(client, buyer, { ...checkout, amount: 0.01 });
    expect(result.amount).toBe(1.18);
    expect(result.items[0]).toMatchObject({ id: "pubg-60-uc", name: "PUBG: Mobile - 60 UC", currency: "USD" });
    expect(mocks.create.mock.calls[0][0]).toMatchObject({ amount: 118, metadata: { order_type: "topup", topup_fields: JSON.stringify(topUp.fields) } });
    expect(mocks.db).not.toHaveBeenCalled();
  });
  it.each([
    { ...topUp, fields: {} },
    { ...topUp, fields: { uid: "   " } },
    { ...topUp, packageId: "unknown" },
    { ...topUp, gameSlug: "mobile-legends" },
    { ...topUp, fields: { uid: "512345678", extra: "unexpected" } },
  ])("rejects invalid package or missing player details: %j", async selection => {
    await expect(createCheckoutPayment(client, buyer, { requestId, topUp: selection })).rejects.toThrow();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects packages below the card minimum", async () => {
    await expect(createCheckoutPayment(client, buyer, { requestId, topUp: {
      gameSlug: "mobile-legends", packageId: "mlbb-14-diamonds", fields: { "user-id": "123", "zone-id": "456" },
    } })).rejects.toThrow("$0.50");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("reuses retries and creates a new payment when the recipient changes", async () => {
    await createCheckoutPayment(client, buyer, checkout);
    await createCheckoutPayment(client, buyer, checkout);
    await createCheckoutPayment(client, buyer, { requestId, topUp: { ...topUp, fields: { uid: "598765432" } } });
    expect(mocks.create.mock.calls[0][1]).toEqual(mocks.create.mock.calls[1][1]);
    expect(mocks.create.mock.calls[0][1]).not.toEqual(mocks.create.mock.calls[2][1]);
  });
  it("records a stable nullable-product order without marking the top-up delivered", async () => {
    const snapshot = await recordPaidOrder(topUpIntent());
    await recordPaidOrder(topUpIntent());
    expect(snapshot).toMatchObject({ total: 1.18, topUp, items: [{ id: "pubg-60-uc", name: "PUBG: Mobile - 60 UC" }] });
    expect(mocks.rows.mock.calls[0]).toEqual(mocks.rows.mock.calls[1]);
    expect(mocks.rows.mock.calls[0][0][0]).toMatchObject({ product_id: null, status: "processing", total_price: 1.18 });
  });
  it("rejects altered top-up metadata and amount mismatches", () => {
    const invalid = topUpIntent();
    invalid.metadata.topup_fields = "{}";
    expect(() => readPaidLines(invalid)).toThrow();
    const mismatched = topUpIntent();
    mismatched.amount = 1;
    expect(() => readPaidLines(mismatched)).toThrow("amount");
  });
  it("verifies a top-up payment using its server snapshot", async () => {
    mocks.retrieve.mockResolvedValue(topUpIntent());
    expect(await verifyCheckoutPayment(buyer, { paymentIntent: "pi_test123" })).toMatchObject({
      status: "succeeded", recorded: true, snapshot: { total: 1.18, topUp },
    });
  });
  it("continues to reject live Stripe keys for top-ups", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_not_allowed";
    await expect(createCheckoutPayment(client, buyer, checkout)).rejects.toThrow("test mode");
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe("payment verification", () => {
  it("requires a verified Supabase session", async () => {
    await expect(authenticatePaymentRequest(new Request("http://localhost"))).rejects.toMatchObject({status:401});
    mocks.auth.mockResolvedValue({data:{user:null},error:{message:"invalid"}});
    await expect(authenticatePaymentRequest(new Request("http://localhost",{headers:{Authorization:"Bearer invalid"}}))).rejects.toMatchObject({status:401});
  });
  it("rejects payment belonging to another buyer", async () => {
    await expect(verifyCheckoutPayment("other",{paymentIntent:"pi_test123"})).rejects.toMatchObject({status:404});
    expect(mocks.rows).not.toHaveBeenCalled();
  });
  it("does not record an unpaid intent", async () => {
    mocks.retrieve.mockResolvedValue(intent({status:"requires_payment_method",amount_received:0}));
    expect(await verifyCheckoutPayment(buyer,{paymentIntent:"pi_test123"})).toEqual({status:"requires_payment_method",recorded:false});
    expect(mocks.rows).not.toHaveBeenCalled();
  });
  it("rejects amount mismatches and unrelated intents", () => {
    expect(()=>readPaidLines(intent({amount:1}))).toThrow("amount");
    expect(()=>readPaidLines(intent({metadata:{}}))).toThrow("belong");
  });
  it("records trusted prices and stable order IDs on retry", async () => {
    const snapshot=await recordPaidOrder(intent());
    await recordPaidOrder(intent());
    expect(snapshot.total).toBe(39.99);
    expect(mocks.rows.mock.calls[0]).toEqual(mocks.rows.mock.calls[1]);
    expect(mocks.rows.mock.calls[0][0][0]).toMatchObject({buyer_id:buyer,total_price:39.99,status:"completed"});
  });
  it("keeps a confirmed payment separate from failed database recording", async () => {
    mocks.rows.mockResolvedValue({error:{message:"offline"}});
    expect(await verifyCheckoutPayment(buyer,{paymentIntent:"pi_test123"})).toMatchObject({status:"succeeded",recorded:false,snapshot:{total:39.99}});
  });
});
