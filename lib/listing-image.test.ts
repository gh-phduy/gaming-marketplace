import { describe, expect, it } from "vitest";
import { MAX_LISTING_IMAGE_BYTES, validateListingImage } from "./listing-image";

describe("listing image validation",()=>{
  it.each([
    ["image/png",[137,80,78,71,13,10,26,10],"png"],
    ["image/jpeg",[255,216,255],"jpg"],
    ["image/gif",[71,73,70,56,57,97],"gif"],
    ["image/webp",[82,73,70,70,0,0,0,0,87,69,66,80],"webp"],
  ] as const)("checks %s file signatures",(type,bytes,extension)=>{
    expect(validateListingImage(type,new Uint8Array(bytes))).toBe(extension);
  });
  it("rejects renamed HTML, SVG and empty files",()=>{
    expect(()=>validateListingImage("image/png",new TextEncoder().encode("<html>"))).toThrow("valid");
    expect(()=>validateListingImage("image/svg+xml",new TextEncoder().encode("<svg/>"))).toThrow("valid");
    expect(()=>validateListingImage("image/png",new Uint8Array())).toThrow();
  });
  it("rejects an oversized file before upload",()=>{
    expect(()=>validateListingImage("image/png",new Uint8Array(MAX_LISTING_IMAGE_BYTES+1))).toThrow("2.5 MB");
  });
});
