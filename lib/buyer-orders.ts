import { supabase } from "./supabase";
import type { OrderSummary } from "@/app/[locale]/(main)/account/dashboard/_lib/dashboard.data";

export async function getBuyerOrders(buyerId: string): Promise<OrderSummary[]> {
  // Scope history to the signed-in buyer; database RLS remains the access boundary.
  const { data, error } = await supabase
    .from("orders")
    .select("id,total_price,currency,status,created_at,product:products(title)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error("Could not load your orders. Please try again.");
  return (data ?? []).map((row) => {
    // Supabase relation shapes vary; top-up orders may have no related product.
    const product = Array.isArray(row.product) ? row.product[0] : row.product;
    return {
      id: row.id,
      productName: product?.title || "Direct top-up / unavailable product",
      date: new Date(row.created_at).toLocaleDateString("en-US"),
      status: row.status as OrderSummary["status"],
      amount: Number(row.total_price),
      currencySymbol: row.currency === "USD" ? "$" : `${row.currency} `,
    };
  });
}
