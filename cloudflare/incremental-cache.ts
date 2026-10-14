import type {
  CacheEntryType,
  CacheValue,
  IncrementalCache,
  WithLastModified,
} from "@opennextjs/aws/types/overrides";
import staticAssetsCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const CACHE_NAME = "next-incremental";

function cacheUrl(key: string, type: CacheEntryType = "cache") {
  // The generated Worker sets this before both middleware and server handling.
  // Server-only process variables need not exist in the middleware runtime.
  const buildTimestamp = (
    globalThis as typeof globalThis & {
      __BUILD_TIMESTAMP_MS__?: number;
    }
  ).__BUILD_TIMESTAMP_MS__;
  const buildId =
    buildTimestamp ?? process.env.OPEN_NEXT_BUILD_ID ?? "development";
  return `https://next-cache.internal/${encodeURIComponent(buildId)}/${type}/${encodeURIComponent(key)}`;
}

/** Writable, per-edge ISR cache; Next.js controls freshness using lastModified. */
const edgeIncrementalCache: IncrementalCache = {
  name: "cf-cache-api-incremental-cache",
  async get<CacheType extends CacheEntryType = "cache">(
    key: string,
    type?: CacheType,
  ) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(cacheUrl(key, type));
      if (response) {
        return (await response.json()) as WithLastModified<
          CacheValue<CacheType>
        >;
      }
    } catch (error) {
      console.error("Could not read the edge incremental cache", error);
    }
    // Keep build-time entries available after deployment or an edge eviction.
    return staticAssetsCache.get(key, type);
  },
  async set(key, value, type) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(
        cacheUrl(key, type),
        Response.json(
          { value, lastModified: Date.now() },
          // This is storage retention, not the page/data revalidation interval.
          { headers: { "Cache-Control": "public, max-age=86400" } },
        ),
      );
    } catch (error) {
      console.error("Could not write the edge incremental cache", error);
    }
  },
  async delete(key) {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      (["cache", "fetch", "composable"] as const).map((type) =>
        cache.delete(cacheUrl(key, type)),
      ),
    );
  },
};

export default edgeIncrementalCache;
