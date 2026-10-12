import { supabase } from "@/lib/supabase";
import { LISTING_IMAGE_TYPES, MAX_LISTING_IMAGE_BYTES } from "./listing-image";

export async function uploadListingImage(file: File, sellerId: string) {
  if (!LISTING_IMAGE_TYPES.includes(file.type)) throw new Error("Please choose a JPG, PNG, WebP or GIF image.");
  if (file.size > MAX_LISTING_IMAGE_BYTES) throw new Error("Image must be smaller than 2.5 MB.");
  const {data:{session}} = await supabase.auth.getSession();
  if (!session || session.user.id !== sellerId) throw new Error("Please sign in again before uploading an image.");
  const body = new FormData();
  body.append("file",file);
  const response = await fetch("/api/listings/image",{method:"POST",headers:{Authorization:`Bearer ${session.access_token}`},body});
  const result = await response.json();
  if (!response.ok || !result.imageUrl) throw new Error(result.error || "Could not upload the image.");
  return result.imageUrl as string;
}
