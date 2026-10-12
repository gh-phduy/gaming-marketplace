import { authenticatePaymentRequest, verifyCheckoutPayment, paymentErrorResponse } from "@/lib/payments/server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const { user } = await authenticatePaymentRequest(request);
    return Response.json(await verifyCheckoutPayment(user.id, await request.json()), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return paymentErrorResponse(error); }
}
