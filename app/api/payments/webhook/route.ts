import { getStripe, recordPaidOrder, PaymentError, paymentErrorResponse } from "@/lib/payments/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return paymentErrorResponse(new PaymentError("Webhook is not configured.", 503));
  let event;
  try {
    event = await getStripe().webhooks.constructEventAsync(
      await request.text(), request.headers.get("stripe-signature") || "", secret,
      undefined, Stripe.createSubtleCryptoProvider(),
    );
  } catch { return Response.json({ error: "Invalid webhook signature." }, { status: 400 }); }
  try {
    if (event.type === "payment_intent.succeeded" && event.data.object.metadata.app === "difmark-test-checkout-v1") {
      await recordPaidOrder(event.data.object);
    }
    return Response.json({ received: true });
  } catch (error) { return paymentErrorResponse(error); }
}
