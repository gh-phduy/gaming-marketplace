import { supabase } from "@/lib/supabase";

export async function paymentRequest<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in to pay.");
  const response = await fetch(path, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  // A proxy or Worker failure can return HTML instead of the API's JSON body.
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof result?.error === "string"
      ? result.error
      : `Payment service unavailable (HTTP ${response.status}). Please try again.`);
  }
  if (!result || typeof result !== "object") {
    throw new Error("Payment service returned an unexpected response. Please try again.");
  }
  return result as T;
}
