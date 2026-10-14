import { describe, expect, it } from "vitest";
import { canCacheImage, getImageCacheKey, withImageCache } from "./image-cache";

const imageRequest = new Request(
  "https://example.test/_next/image?url=%2Fhero.webp&w=750&q=75",
);

describe("optimized image caching", () => {
  it("separates AVIF, WebP and original formats at the edge", () => {
    const keys = ["image/avif,image/webp", "image/webp", "image/jpeg"].map(
      (accept) =>
        getImageCacheKey(
          new Request(imageRequest, { headers: { Accept: accept } }),
        )?.url,
    );
    expect(new Set(keys).size).toBe(3);
    expect(
      getImageCacheKey(
        new Request(imageRequest, { headers: { Accept: "image/avif,*/*" } }),
      )?.url,
    ).toBe(keys[0]);
    expect(
      getImageCacheKey(
        new Request(imageRequest, {
          headers: { Authorization: "Bearer private" },
        }),
      ),
    ).toBeNull();
    expect(
      getImageCacheKey(new Request(imageRequest, { method: "HEAD" })),
    ).toBeNull();
  });
  it("adds a finite TTL while preserving the image bytes and format variation", async () => {
    const response = withImageCache(
      imageRequest,
      new Response("image", {
        headers: {
          "Content-Type": "image/avif",
          Vary: "Accept",
          "Content-Security-Policy": "sandbox;",
        },
      }),
    );
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=86400, s-maxage=604800",
    );
    expect(canCacheImage(response)).toBe(true);
    expect(response.headers.get("Vary")).toBe("Accept");
    expect(response.headers.get("Content-Security-Policy")).toBe("sandbox;");
    expect(await response.text()).toBe("image");
  });
  it.each([
    ["https://storage.test/Image/avt_user/user.png", "public, max-age=3600"],
    [
      "https://storage.test/Image/seller_listings/user/7bfdfba1-6335-4da1-b72e-c458d7de6c70.webp",
      "public, max-age=31536000, immutable",
    ],
    [
      "https://storage.test/Image/seller_listings/user/current.webp",
      "public, max-age=86400, s-maxage=604800",
    ],
  ])("sets a safe policy for %s", (source, policy) => {
    const url = new URL(imageRequest.url);
    url.searchParams.set("url", source);
    const response = withImageCache(
      new Request(url),
      new Response(null, { headers: { "Content-Type": "image/webp" } }),
    );
    expect(response.headers.get("Cache-Control")).toBe(policy);
  });
  it.each(["private, no-store", "public, max-age=31536000, immutable"])(
    "preserves an existing %s policy",
    (policy) => {
      const response = new Response(null, {
        headers: { "Content-Type": "image/webp", "Cache-Control": policy },
      });
      expect(withImageCache(imageRequest, response)).toBe(response);
      expect(canCacheImage(response)).toBe(policy.includes("public"));
    },
  );
  it("does not cache errors, HTML, or cookie-setting responses", () => {
    for (const response of [
      new Response(null, {
        status: 404,
        headers: { "Content-Type": "image/webp" },
      }),
      new Response("error", { headers: { "Content-Type": "text/html" } }),
      new Response(null, {
        headers: {
          "Content-Type": "image/webp",
          "Set-Cookie": "session=private",
        },
      }),
    ])
      expect(withImageCache(imageRequest, response)).toBe(response);
  });
  it("leaves application and API responses unchanged", () => {
    const response = new Response(null, {
      headers: { "Content-Type": "image/webp" },
    });
    expect(
      withImageCache(new Request("https://example.test/api/avatar"), response),
    ).toBe(response);
    expect(
      withImageCache(new Request(imageRequest, { method: "POST" }), response),
    ).toBe(response);
  });
});
