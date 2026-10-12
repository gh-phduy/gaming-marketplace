import { createHash } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { z } from "zod";
import type { CheckoutOrderSnapshot } from "@/components/checkout/checkout-session";
import { validateTopUpSelection } from "./topup";

const APP = "difmark-test-checkout-v1";
export class PaymentError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function paymentErrorResponse(error: unknown) {
  const known = error instanceof PaymentError;
  if (!known) console.error("Payment request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ error: known ? error.message : "Payment service unavailable. Please try again." }, {
    status: known ? error.status : error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 500,
    headers: { "Cache-Control": "no-store" },
  });
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  // The demo catalog has no real fulfillment system. Refuse live charges.
  if (!key?.startsWith("sk_test_")) throw new PaymentError("Stripe test mode is not configured.", 503);
  return new Stripe(key, {
    // Workers supports fetch natively; Node's HTTP transport can hang here.
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 20_000,
    maxNetworkRetries: 1,
  });
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new PaymentError("Database is not configured.", 503);
  return { url, key };
}

function adminClient() {
  const { url } = supabaseConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new PaymentError("Order recording is not configured.", 503);
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function authenticatePaymentRequest(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) throw new PaymentError("Please sign in to pay.", 401);
  const { url, key } = supabaseConfig();
  const client = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new PaymentError("Your session expired. Please sign in again.", 401);
  return { client, user: data.user };
}

const cartSchema = z.object({
  requestId: z.string().uuid(),
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(100) })).min(1).max(20),
});

export async function createCheckoutPayment(client: SupabaseClient, buyerId: string, input: unknown) {
  if (input && typeof input === "object" && "topUp" in input) return createTopUpPayment(buyerId, input);
  const parsed = cartSchema.safeParse(input);
  if (!parsed.success) throw new PaymentError("Choose 1–20 catalog products with valid quantities.");
  adminClient(); // Refuse to charge if order recording is not configured.
  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
  const ids = [...quantities.keys()].sort();
  const { data, error } = await client.from("products")
    .select("id,title,price,currency,stock,status,platform,image_url")
    .in("id", ids).eq("status", "published");
  if (error) throw new PaymentError("Unable to load product prices.", 503);
  if (!data || data.length !== ids.length) throw new PaymentError("Some products are no longer available.");
  const items = ids.map(id => {
    const product = data.find(p => p.id === id)!;
    const quantity = quantities.get(id)!;
    const unitAmount = Math.round(Number(product.price) * 100);
    if (product.currency !== "USD") throw new PaymentError("This checkout currently supports USD products only.");
    if (quantity > 100 || quantity > product.stock) throw new PaymentError("Insufficient stock for one or more products.");
    if (product.price === null || !Number.isSafeInteger(unitAmount) || unitAmount <= 0) throw new PaymentError("A product has an invalid price.");
    return { id, quantity, unitAmount, name: product.title, price: unitAmount / 100,
      currency: "USD", platform: product.platform || "PC", image: product.image_url || "/battlefield_6.jpg" };
  });
  const amount = items.reduce((total, item) => total + item.unitAmount * item.quantity, 0);
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 99999999) throw new PaymentError("Checkout total must be between $0.50 and $999,999.99.");
  const metadata: Record<string, string> = { app: APP, buyer_id: buyerId, item_count: String(items.length) };
  items.forEach((item, index) => { metadata[`item_${index}`] = JSON.stringify([item.id, item.quantity, item.unitAmount]); });
  const digest = createHash("sha256").update(JSON.stringify(metadata)).digest("hex");
  const intent = await getStripe().paymentIntents.create({ amount, currency: "usd", metadata,
    payment_method_types: ["card"] }, {
    idempotencyKey: `${APP}:${buyerId}:${parsed.data.requestId}:${digest}`,
  });
  if (!intent.client_secret) throw new PaymentError("Unable to initialize payment.", 503);
  return { clientSecret: intent.client_secret, amount: amount / 100, currency: "USD", items };
}

const paidLineSchema = z.tuple([z.string().uuid(), z.number().int().min(1).max(100), z.number().int().positive()]);
const paidTopUpLineSchema = z.tuple([z.string().min(1).max(100), z.literal(1), z.number().int().positive()]);

async function createTopUpPayment(buyerId: string, input: unknown) {
  const { requestId, topUp } = z.object({ requestId: z.string().uuid(), topUp: z.unknown() }).parse(input);
  let selected;
  try { selected = validateTopUpSelection(topUp); }
  catch (error) { throw new PaymentError(error instanceof z.ZodError ? "Enter valid player details (up to 100 characters per field)." : error instanceof Error ? error.message : "Invalid top-up selection."); }
  adminClient();
  const { game, item, selection } = selected;
  const amount = Math.round(item.price * 100);
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 99999999) throw new PaymentError("Choose a top-up package worth at least $0.50 for card payment.");
  const metadata = { app: APP, buyer_id: buyerId, item_count: "1", order_type: "topup",
    item_0: JSON.stringify([item.id, 1, amount]), topup_game: game.slug,
    topup_fields: JSON.stringify(Object.fromEntries(Object.entries(selection.fields).sort(([a], [b]) => a.localeCompare(b)))),
    topup_region: game.regionLabel };
  if (metadata.topup_fields.length > 500) throw new PaymentError("Player details are too long.");
  const digest = createHash("sha256").update(JSON.stringify(metadata)).digest("hex");
  const intent = await getStripe().paymentIntents.create({ amount, currency: "usd", metadata, payment_method_types: ["card"] }, {
    idempotencyKey: `${APP}:${buyerId}:${requestId}:${digest}`,
  });
  if (!intent.client_secret) throw new PaymentError("Unable to initialize payment.", 503);
  return { clientSecret: intent.client_secret, amount: amount / 100, currency: "USD", items: [{
    id: item.id, quantity: 1, name: `${game.title} - ${item.label}`, price: amount / 100,
    currency: "USD", platform: "Direct Top Up", image: game.iconImage,
  }] };
}

function readPaidTopUp(intent: Stripe.PaymentIntent) {
  const [packageId] = paidTopUpLineSchema.parse(JSON.parse(intent.metadata.item_0));
  return validateTopUpSelection({ gameSlug: intent.metadata.topup_game, packageId,
    fields: JSON.parse(intent.metadata.topup_fields) });
}

export function readPaidLines(intent: Stripe.PaymentIntent) {
  if (intent.metadata.app !== APP || !z.string().uuid().safeParse(intent.metadata.buyer_id).success || intent.livemode) {
    throw new PaymentError("This payment does not belong to this test checkout.", 403);
  }
  const count = Number(intent.metadata.item_count);
  if (intent.metadata.order_type === "topup") {
    if (count !== 1) throw new PaymentError("Invalid top-up order.", 409);
    readPaidTopUp(intent);
  } else if (intent.metadata.order_type) throw new PaymentError("Invalid order type.", 409);
  if (!Number.isInteger(count) || count < 1 || count > 20) throw new PaymentError("Invalid payment order.", 409);
  const items = Array.from({ length: count }, (_, i) => {
    const schema = intent.metadata.order_type === "topup" ? paidTopUpLineSchema : paidLineSchema;
    const [id, quantity, unitAmount] = schema.parse(JSON.parse(intent.metadata[`item_${i}`]));
    return { id, quantity, unitAmount };
  });
  const expected = items.reduce((sum, item) => sum + item.quantity * item.unitAmount, 0);
  if (new Set(items.map(item => item.id)).size !== count || intent.currency !== "usd" || expected !== intent.amount) {
    throw new PaymentError("Payment amount does not match the order.", 409);
  }
  return items;
}

function orderId(intentId: string, productId: string) {
  const hash = createHash("sha256").update(`${APP}:${intentId}:${productId}`).digest("hex");
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
}

function paidSnapshot(intent: Stripe.PaymentIntent, products: { id: string; title: string; platform: string; image_url: string | null }[] = []): CheckoutOrderSnapshot {
  const topUp = intent.metadata.order_type === "topup" ? readPaidTopUp(intent) : null;
  return {
    ...(topUp ? { topUp: topUp.selection } : {}),
    items: readPaidLines(intent).map(item => {
      const product = products.find(p => p.id === item.id);
      return { id: item.id, quantity: item.quantity, price: item.unitAmount / 100, currency: "USD",
        name: topUp ? `${topUp.game.title} - ${topUp.item.label}` : product?.title || "Purchased product",
        platform: topUp ? "Direct Top Up" : product?.platform || "PC", image: topUp?.game.iconImage || product?.image_url || "/battlefield_6.jpg" };
    }),
    subtotal: intent.amount / 100, total: intent.amount_received / 100, currency: "USD",
    createdAt: new Date(intent.created * 1000).toISOString(),
  };
}

export async function recordPaidOrder(intent: Stripe.PaymentIntent) {
  const lines = readPaidLines(intent);
  if (intent.status !== "succeeded" || intent.amount_received !== intent.amount) throw new PaymentError("Payment has not succeeded.", 409);
  const db = adminClient();
  const rows = lines.map(item => ({ id: orderId(intent.id, item.id), buyer_id: intent.metadata.buyer_id,
    product_id: intent.metadata.order_type === "topup" ? null : item.id, quantity: item.quantity, total_price: item.quantity * item.unitAmount / 100,
    currency: "USD", status: intent.metadata.order_type === "topup" ? "processing" : "completed", stripe_payment_intent: intent.id }));
  const { error } = await db.from("orders").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw new PaymentError("Payment confirmed, but order recording failed. Please retry or contact support.", 503);
  if (intent.metadata.order_type === "topup") return paidSnapshot(intent);
  const { data: products, error: productError } = await db.from("products").select("id,title,platform,image_url").in("id", lines.map(item => item.id));
  if (productError) throw new PaymentError("Unable to load the confirmed order.", 503);
  return paidSnapshot(intent, products ?? []);
}

export async function verifyCheckoutPayment(buyerId: string, input: unknown) {
  const { paymentIntent } = z.object({ paymentIntent: z.string().regex(/^pi_[A-Za-z0-9]+$/) }).parse(input);
  const intent = await getStripe().paymentIntents.retrieve(paymentIntent);
  if (intent.metadata.buyer_id !== buyerId) throw new PaymentError("Payment not found for this account.", 404);
  readPaidLines(intent);
  if (intent.status !== "succeeded") return { status: intent.status, recorded: false };
  try {
    return { status: "succeeded", recorded: true, snapshot: await recordPaidOrder(intent) };
  } catch (error) {
    if (error instanceof PaymentError && error.status === 503) return { status: "succeeded", recorded: false, error: error.message, snapshot: paidSnapshot(intent) };
    throw error;
  }
}
