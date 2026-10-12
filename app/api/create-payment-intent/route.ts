import { NextResponse } from "next/server";
import { authenticatePaymentRequest, createCheckoutPayment, paymentErrorResponse } from "@/lib/payments/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { client, user } = await authenticatePaymentRequest(request);
    return NextResponse.json(await createCheckoutPayment(client, user.id, await request.json()), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
