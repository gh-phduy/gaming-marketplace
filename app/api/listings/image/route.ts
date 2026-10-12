import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { MAX_LISTING_IMAGE_BYTES, validateListingImage } from "@/lib/listing-image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return Response.json({error:"Please sign in to upload an image."},{status:401});
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const backendKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publicKey || !backendKey) return Response.json({error:"Image storage is not configured."},{status:503});
  try {
    const authClient = createClient(url, publicKey, {auth:{persistSession:false,autoRefreshToken:false}});
    const {data, error} = await authClient.auth.getUser(token);
    if (error || !data.user) return Response.json({error:"Your session expired. Please sign in again."},{status:401});
    const length = Number(request.headers.get("content-length"));
    if (length > MAX_LISTING_IMAGE_BYTES + 65536) return Response.json({error:"Image must be smaller than 2.5 MB."},{status:413});
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") return Response.json({error:"Choose an image file."},{status:400});
    if (file.size > MAX_LISTING_IMAGE_BYTES) return Response.json({error:"Image must be smaller than 2.5 MB."},{status:413});
    const bytes = new Uint8Array(await file.arrayBuffer());
    let extension: string;
    try { extension = validateListingImage(file.type, bytes); }
    catch (error) { return Response.json({error:error instanceof Error ? error.message : "Invalid image."},{status:400}); }
    const admin = createClient(url, backendKey, {auth:{persistSession:false,autoRefreshToken:false}});
    const path = `seller_listings/${data.user.id}/${randomUUID()}.${extension}`;
    const bucket = admin.storage.from("Image");
    const {error:uploadError} = await bucket.upload(path, bytes, {contentType:file.type,upsert:false});
    if (uploadError) return Response.json({error:"Could not upload the image. Please try again."},{status:503});
    return Response.json({imageUrl:bucket.getPublicUrl(path).data.publicUrl},{headers:{"Cache-Control":"no-store"}});
  } catch { return Response.json({error:"Image upload failed. Please try again."},{status:500}); }
}
