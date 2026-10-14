/** Cache API keys must distinguish the format selected by content negotiation. */
export function getImageCacheKey(request: Request): Request | null {
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    !["/_next/image", "/_next/image/"].includes(url.pathname) ||
    request.headers.has("Authorization")
  )
    return null;

  const accept = request.headers.get("Accept") ?? "";
  url.searchParams.set(
    "__format",
    accept.includes("image/avif")
      ? "avif"
      : accept.includes("image/webp")
        ? "webp"
        : "source",
  );
  // Bump the namespace when the response policy changes; old entries retain
  // their original headers until eviction.
  url.searchParams.set("__cache_version", "2");
  return new Request(url);
}

export function canCacheImage(response: Response): boolean {
  const policy = response.headers.get("Cache-Control") ?? "";
  return (
    response.status === 200 &&
    Boolean(response.headers.get("Content-Type")?.startsWith("image/")) &&
    !response.headers.has("Set-Cookie") &&
    /\bpublic\b/.test(policy) &&
    !/\b(?:private|no-store|no-cache)\b/.test(policy)
  );
}

/** OpenNext's Images binding does not set a TTL on non-immutable images. */
export function withImageCache(request: Request, response: Response): Response {
  const url = new URL(request.url);
  if (
    !["GET", "HEAD"].includes(request.method) ||
    request.headers.has("Authorization") ||
    !["/_next/image", "/_next/image/"].includes(url.pathname) ||
    response.status !== 200 ||
    !response.headers.get("Content-Type")?.startsWith("image/") ||
    response.headers.has("Cache-Control") ||
    response.headers.has("Set-Cookie")
  ) {
    return response;
  }

  const cachedResponse = new Response(response.body, response);
  const source = url.searchParams.get("url") ?? "";
  // Listing uploads use a fresh UUID and upsert:false. Avatars and other named
  // images may change in place and therefore keep a finite lifetime.
  const immutableListing =
    /\/seller_listings\/[^/]+\/[0-9a-f]{8}-[0-9a-f-]{27}\.(?:png|jpg|webp)(?:\?|$)/i.test(
      source,
    );
  const avatar = /\/(?:avt_user|avatars?)\//i.test(source);
  cachedResponse.headers.set(
    "Cache-Control",
    immutableListing
      ? "public, max-age=31536000, immutable"
      : avatar
        ? "public, max-age=3600"
        : "public, max-age=86400, s-maxage=604800",
  );
  return cachedResponse;
}
