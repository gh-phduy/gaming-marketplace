import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import edgeIncrementalCache from "./cloudflare/incremental-cache";
import edgeQueue from "./cloudflare/revalidation-queue";

export default {
  ...defineCloudflareConfig({
    incrementalCache: edgeIncrementalCache,
    queue: edgeQueue,
    enableCacheInterception: true,
  }),
  // The dashboard runs npm run build; the adapter builds Next.js with this
  // separate command so it does not recursively invoke itself.
  buildCommand: "npm run build:next",
};
