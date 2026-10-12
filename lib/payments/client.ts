import { supabase } from "@/lib/supabase";

export async function paymentRequest<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in to pay.");
  const response = await fetch(path, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Payment service unavailable. Please try again.");
  return result as T;
}
