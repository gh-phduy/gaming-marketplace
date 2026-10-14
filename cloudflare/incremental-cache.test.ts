import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import edgeCache from "./incremental-cache";

const fallback = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock(
  "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache",
  () => ({ default: fallback }),
);

const entries = new Map<string, Response>();
const page = {
  type: "app" as const,
  html: "Public catalog",
  rsc: "cards",
  revalidate: 60,
};
beforeEach(() => {
  entries.clear();
  fallback.get.mockReset().mockResolvedValue(null);
  vi.stubEnv("OPEN_NEXT_BUILD_ID", "build-a");
  vi.stubGlobal("caches", {
    open: async () => ({
      match: async (url: string) => entries.get(url)?.clone(),
      put: async (url: string, response: Response) => {
        entries.set(url, response.clone());
      },
      delete: async (url: string) => entries.delete(url),
    }),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("edge incremental cache", () => {
  it("preserves the original write time so Next.js can revalidate stale data", async () => {
    await edgeCache.set("en", page);
    const first = await edgeCache.get("en");
    expect(first?.value).toEqual(page);
    expect(first?.lastModified).toEqual(expect.any(Number));
    expect(await edgeCache.get("en")).toEqual(first);
    expect(fallback.get).not.toHaveBeenCalled();
  });
  it("isolates deployments and falls back to build assets on an edge miss", async () => {
    await edgeCache.set("en", page);
    vi.stubEnv("OPEN_NEXT_BUILD_ID", "build-b");
    expect(await edgeCache.get("en")).toBeNull();
    expect(fallback.get).toHaveBeenCalledWith("en", undefined);
  });
  it("shares the cache between middleware and server process environments", async () => {
    vi.stubGlobal("__BUILD_TIMESTAMP_MS__", 1000);
    await edgeCache.set("en", page);
    vi.stubEnv("OPEN_NEXT_BUILD_ID", "server-only-value");
    expect((await edgeCache.get("en"))?.value).toEqual(page);
    vi.stubGlobal("__BUILD_TIMESTAMP_MS__", 2000);
    expect(await edgeCache.get("en")).toBeNull();
  });
  it("keeps fetch and page entries separate and deletes both", async () => {
    await edgeCache.set("same-key", page, "cache");
    const data = {
      kind: "FETCH" as const,
      data: { headers: {}, body: "[]", url: "catalog" },
    };
    await edgeCache.set("same-key", data, "fetch");
    expect((await edgeCache.get("same-key", "cache"))?.value).toEqual(page);
    expect((await edgeCache.get("same-key", "fetch"))?.value).toEqual(data);
    await edgeCache.delete("same-key");
    expect(entries.size).toBe(0);
  });
  it("serves build-time entries when the cache service is unavailable", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("caches", {
      open: async () => {
        throw new Error("unavailable");
      },
    });
    fallback.get.mockResolvedValue({ value: page, lastModified: 1000 });
    expect(await edgeCache.get("en")).toEqual({
      value: page,
      lastModified: 1000,
    });
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });
});
