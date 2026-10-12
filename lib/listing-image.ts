export const MAX_LISTING_IMAGE_BYTES = Math.floor(2.5 * 1024 * 1024);
export const LISTING_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateListingImage(type: string, bytes: Uint8Array) {
  if (!bytes.length || bytes.length > MAX_LISTING_IMAGE_BYTES) throw new Error("Image must be smaller than 2.5 MB.");
  const matches = (offset: number, signature: number[]) => signature.every((value, index) => bytes[offset + index] === value);
  if (type === "image/png" && matches(0, [137,80,78,71,13,10,26,10])) return "png";
  if (type === "image/jpeg" && matches(0, [255,216,255])) return "jpg";
  if (type === "image/webp" && matches(0, [82,73,70,70]) && matches(8, [87,69,66,80])) return "webp";
  if (type === "image/gif" && (matches(0, [71,73,70,56,55,97]) || matches(0, [71,73,70,56,57,97]))) return "gif";
  throw new Error("Please upload a valid JPG, PNG, WebP or GIF image.");
}
