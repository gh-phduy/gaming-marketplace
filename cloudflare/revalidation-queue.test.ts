import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import edgeQueue from "./revalidation-queue";

const background = vi.hoisted(() => ({ fetch: vi.fn(), waitUntil: vi.fn() }));
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({
    env: { WORKER_SELF_REFERENCE: { fetch: background.fetch } },
    ctx: { waitUntil: background.waitUntil },
  }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("__MARKETPLACE_ISR_TOKEN", "test-revalidation-token");
});
afterEach(() => vi.unstubAllGlobals());

describe("background edge revalidation", () => {
  it("returns while the refresh is pending and keeps that work alive", async () => {
    let complete!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      complete = resolve;
    });
    background.fetch.mockReturnValue(pending);
    const message = {
      MessageDeduplicationId: "en-version",
      MessageGroupId: "0",
      MessageBody: {
        host: "example.test",
        url: "/en",
        lastModified: 1000,
        eTag: "page",
      },
    };
    await edgeQueue.send(message);
    expect(background.waitUntil).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(background.fetch).toHaveBeenCalledOnce());
    expect(background.fetch).toHaveBeenCalledWith(
      "https://example.test/en",
      expect.objectContaining({
        method: "HEAD",
        headers: {
          "x-prerender-revalidate": "test-revalidation-token",
          "x-isr": "1",
        },
      }),
    );
    await edgeQueue.send(message);
    expect(background.waitUntil).toHaveBeenCalledOnce();
    complete(
      new Response(null, { headers: { "x-nextjs-cache": "REVALIDATED" } }),
    );
    await background.waitUntil.mock.calls[0][0];
  });
});
