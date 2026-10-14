import handler from "../.open-next/worker.js";
import prerenderManifest from "../.next/prerender-manifest.json";
import {
  canCacheImage,
  getImageCacheKey,
  withImageCache,
} from "./image-cache.ts";

// Build metadata stays private in the Worker bundle and is shared by its
// middleware/server modules without storing request state globally.
Object.defineProperty(globalThis, "__MARKETPLACE_ISR_TOKEN", {
  value: prerenderManifest.preview.previewModeId,
});

const worker = {
  /**
   * @param {Request} request
   * @param {CloudflareEnv} env
   * @param {ExecutionContext} ctx
   */
  async fetch(request, env, ctx) {
    const key = getImageCacheKey(request);
    let cache;
    if (key) {
      try {
        cache = await caches.open("next-images");
        const cached = await cache.match(key);
        if (cached) return cached;
      } catch (error) {
        console.error("Could not read the optimized image cache", error);
      }
    }

    const response = withImageCache(
      request,
      await handler.fetch(request, env, ctx),
    );
    if (cache && key && canCacheImage(response)) {
      ctx.waitUntil(
        cache.put(key, response.clone()).catch((error) => {
          console.error("Could not write the optimized image cache", error);
        }),
      );
    }
    return response;
  },
};

export default worker;
