import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destination = join(root, ".open-next", "assets", "cdn-cgi", "_next_cache");

// OpenNext only prepares this directory automatically for its read-only cache.
// Our writable edge cache also uses these public build entries as its fallback.
await mkdir(destination, { recursive: true });
await cp(join(root, ".open-next", "cache"), destination, { recursive: true });
console.log("Prepared public build cache assets for cold edge locations.");
