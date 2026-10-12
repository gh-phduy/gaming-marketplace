import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSellerListing, readSellerListings, updateSellerListingStatus, deleteSellerListing, type SellerListingInput } from "./seller-marketplace-store";

const mock = vi.hoisted(() => ({ user:vi.fn(), from:vi.fn(), insert:vi.fn(), update:vi.fn(), remove:vi.fn(), eq:vi.fn(), single:vi.fn(), order:vi.fn() }));
vi.mock("@/lib/supabase", () => ({supabase:{auth:{getUser:mock.user},from:mock.from}}));
const seller="20000000-0000-4000-8000-000000000001";
const input: SellerListingInput = {title:"Test game",productType:"Product key",platform:"Steam",edition:"Deluxe",activationRegion:"Global",delivery:"Manual",
  stock:10,price:12.99,currency:"$",imageUrl:"/placeholder_product.svg",description:"Test listing",status:"draft"};
const row={id:"product",seller_id:seller,title:"Test game",category:"game-keys",platform:"Steam",edition:"Deluxe",delivery:"Manual",region:"Global",
  stock:10,price:12.99,currency:"USD",image_url:"/placeholder_product.svg",status:"draft",created_at:"2026-10-12",updated_at:"2026-10-12"};
beforeEach(()=>{
  vi.clearAllMocks(); vi.spyOn(console,"error").mockImplementation(()=>{});
  mock.user.mockResolvedValue({data:{user:{id:seller}},error:null});
  const chain={insert:mock.insert,update:mock.update,delete:mock.remove,eq:mock.eq,select:()=>chain,single:mock.single,order:mock.order};
  mock.from.mockReturnValue(chain); mock.insert.mockReturnValue(chain);mock.update.mockReturnValue(chain);mock.remove.mockReturnValue(chain);mock.eq.mockReturnValue(chain);
  mock.single.mockResolvedValue({data:row,error:null});mock.order.mockResolvedValue({data:[row],error:null});
});
afterEach(()=>vi.restoreAllMocks());
describe("seller listing persistence",()=>{
  it("stores currency/category codes and all edition/delivery settings",async()=>{
    const listing=await createSellerListing(input,seller);
    expect(mock.insert).toHaveBeenCalledWith(expect.objectContaining({seller_id:seller,currency:"USD",category:"game-keys",edition:"Deluxe",delivery:"Manual",is_new:false}));
    expect(listing).toMatchObject({productType:"Product key",edition:"Deluxe",delivery:"Manual",currency:"USD"});
  });
  it("marks published products as new and confirms the saved row",async()=>{
    await createSellerListing({...input,status:"published"},seller);
    expect(mock.insert).toHaveBeenCalledWith(expect.objectContaining({status:"published",is_new:true}));
    expect(mock.single).toHaveBeenCalled();
  });
  it("requires the active authenticated seller to match the supplied account",async()=>{
    await expect(createSellerListing(input,"other")).rejects.toThrow("sign in");
    expect(mock.insert).not.toHaveBeenCalled();
  });
  it.each([{stock:1.5},{price:0},{price:1.234},{currency:"INVALID"},{imageUrl:"data:image/png;base64,abc"}])("rejects invalid listing fields: %j",async patch=>{
    await expect(createSellerListing({...input,...patch},seller)).rejects.toThrow();
    expect(mock.insert).not.toHaveBeenCalled();
  });
  it("scopes publish/pause and deletion to the seller and rejects missing rows",async()=>{
    await updateSellerListingStatus("product","published",seller);
    expect(mock.eq).toHaveBeenCalledWith("seller_id",seller);
    expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({status:"published",is_new:true}));
    mock.single.mockResolvedValue({data:null,error:{message:"No matching product"}});
    await expect(deleteSellerListing("other-product",seller)).rejects.toMatchObject({message:"No matching product"});
  });
  it("does not turn a failed product query into a successful empty list",async()=>{
    mock.order.mockResolvedValue({data:null,error:{message:"database unavailable"}});
    await expect(readSellerListings(seller)).rejects.toMatchObject({message:"database unavailable"});
  });
});
