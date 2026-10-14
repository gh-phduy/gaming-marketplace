import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Queue, QueueMessage } from "@opennextjs/aws/types/overrides";

// Only public job identifiers are shared; I/O belongs to the current context.
const pending = new Set<string>();

async function refresh(message: QueueMessage) {
  const { env } = getCloudflareContext();
  if (!env.WORKER_SELF_REFERENCE)
    throw new Error("Missing Worker self reference");
  // The entry point supplies the immutable build token. Request-scoped process
  // variables are not reliable for a refresh started by the middleware.
  const token = (
    globalThis as typeof globalThis & {
      __MARKETPLACE_ISR_TOKEN?: string;
    }
  ).__MARKETPLACE_ISR_TOKEN;
  if (!token) throw new Error("Missing ISR revalidation configuration");
  const { host, url } = message.MessageBody;
  const protocol = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)
    ? "http"
    : "https";
  const response = await env.WORKER_SELF_REFERENCE.fetch(
    `${protocol}://${host}${url}`,
    {
      method: "HEAD",
      headers: { "x-prerender-revalidate": token, "x-isr": "1" },
      signal: AbortSignal.timeout(25_000),
    },
  );
  await response.body?.cancel();
  if (
    response.status !== 200 ||
    response.headers.get("x-nextjs-cache") !== "REVALIDATED"
  ) {
    throw new Error(`ISR refresh failed with status ${response.status}`);
  }
}

/** Revalidate at the current edge, matching the scope of the writable cache. */
const edgeQueue: Queue = {
  name: "cf-edge-background-queue",
  async send(message) {
    // A shared DO's cross-region success table would incorrectly skip refreshing
    // entries held only at another edge. Dedupe within the current isolate instead.
    const key = message.MessageDeduplicationId;
    if (pending.has(key)) return;
    pending.add(key);
    const task = refresh(message)
      .catch((error) =>
        console.error("Could not refresh the public page cache", error),
      )
      .finally(() => pending.delete(key));
    getCloudflareContext().ctx.waitUntil(task);
  },
};

export default edgeQueue;
