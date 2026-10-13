import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBuyerOrders } from "./buyer-orders";
const mock = vi.hoisted(() => ({ eq: vi.fn(), error: null as null | {message:string}, rows: [] as unknown[] }));
vi.mock("./supabase", () => ({ supabase: { from: (table: string) => { expect(table).toBe("orders"); const query = { select: () => query, eq: mock.eq.mockImplementation(()=>query), order: () => query, limit: () => Promise.resolve({data:mock.rows,error:mock.error}) }; return query; } } }));
beforeEach(()=> { mock.error=null; mock.rows=[]; mock.eq.mockClear(); });
describe("buyer order history",()=>{
 it("restricts the query to the signed-in buyer and preserves paid amount/status",async()=>{
  mock.rows=[{id:"paid",total_price:"39.99",currency:"USD",status:"completed",created_at:"2026-10-13T10:00:00Z",product:{title:"Marathon"}}];
  expect(await getBuyerOrders("buyer-1")).toEqual([expect.objectContaining({id:"paid",productName:"Marathon",amount:39.99,status:"completed",currencySymbol:"$"})]);
  expect(mock.eq).toHaveBeenCalledWith("buyer_id","buyer-1");
 });
 it("handles null-product top-ups and refunded orders",async()=>{
  mock.rows=[{id:"topup",total_price:5,currency:"EUR",status:"refunded",created_at:"2026-10-13T10:00:00Z",product:null}];
  expect((await getBuyerOrders("buyer-1"))[0]).toMatchObject({status:"refunded",currencySymbol:"EUR ",amount:5});
 });
 it("reports database failures rather than showing a false empty history",async()=>{
  mock.error={message:"unavailable"}; await expect(getBuyerOrders("buyer-1")).rejects.toThrow("Could not load your orders");
 });
});
