import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  // The dashboard runs npm run build; the adapter builds Next.js with this
  // separate command so it does not recursively invoke itself.
  buildCommand: "npm run build:next",
};
