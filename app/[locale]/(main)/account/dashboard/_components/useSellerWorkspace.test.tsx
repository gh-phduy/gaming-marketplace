import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getDashboardProfile } from "../_lib/dashboard.data";
import { useSellerWorkspace } from "./useSellerWorkspace";

const mocks=vi.hoisted(()=>({create:vi.fn(),upload:vi.fn(),read:vi.fn()}));
vi.mock("@/components/marketplace/seller-marketplace-store",()=>({
  createSellerListing:mocks.create,readSellerListings:mocks.read,getSellerConversations:async()=>[],
  subscribeSellerMarketplace:()=>()=>{},deleteSellerListing:vi.fn(),markSellerConversationRead:vi.fn(),sendSellerConversationMessage:vi.fn(),updateSellerListingStatus:vi.fn(),
}));
vi.mock("@/lib/listing-image-upload",()=>({uploadListingImage:mocks.upload}));
beforeEach(()=>{vi.clearAllMocks();mocks.read.mockResolvedValue([]);});afterEach(cleanup);
const profile={...getDashboardProfile(),id:"seller"};
it("does not replace a newly saved product with an older in-flight refresh",async()=>{
  let finishRead!: (value:unknown[])=>void;
  mocks.read.mockReturnValue(new Promise(resolve=>{finishRead=resolve;}));
  mocks.create.mockResolvedValue({id:"created",title:"Test listing",status:"published"});
  const {result}=renderHook(()=>useSellerWorkspace(profile));
  await act(async()=>{result.current.updateFormField("title","Test listing");});
  await act(async()=>{await result.current.handleSaveListing("published");});
  await act(async()=>{finishRead([]);});
  expect(result.current.listings.map(item=>item.id)).toEqual(["created"]);
});
it("blocks duplicate saves while the database insert is pending",async()=>{
  let finish!: (value:unknown)=>void;
  mocks.create.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
  const {result}=renderHook(()=>useSellerWorkspace(profile));
  await act(async()=>{result.current.updateFormField("title","Test listing");});
  let first!: Promise<void>;
  await act(async()=>{first=result.current.handleSaveListing("published");void result.current.handleSaveListing("published");});
  expect(mocks.create).toHaveBeenCalledTimes(1);expect(result.current.isSaving).toBe(true);
  await act(async()=>{finish({id:"created",title:"Test listing",status:"published"});await first;});
  expect(result.current.listings).toHaveLength(1);expect(result.current.isSaving).toBe(false);expect(result.current.form.currency).toBe("USD");
});
it("waits for an image upload and keeps its public URL in the form",async()=>{
  let finish!: (value:string)=>void;
  mocks.upload.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
  const {result}=renderHook(()=>useSellerWorkspace(profile));
  await act(async()=>{result.current.updateFormField("title","Test listing");});
  const event={target:{files:[new File(["png"],"cover.png",{type:"image/png"})],value:"cover.png"}} as unknown as React.ChangeEvent<HTMLInputElement>;
  let upload!: Promise<void>;
  await act(async()=>{upload=result.current.handleUploadImage(event);await result.current.handleSaveListing("published");});
  expect(mocks.create).not.toHaveBeenCalled();expect(result.current.isUploading).toBe(true);
  await act(async()=>{finish("https://example.supabase.co/storage/v1/object/public/Image/cover.png");await upload;});
  await waitFor(()=>expect(result.current.form.imageUrl).toContain("/storage/v1/object/public/"));
  expect(result.current.isUploading).toBe(false);
});
