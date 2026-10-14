import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "public", "generated");
await mkdir(output, { recursive: true });
for (const width of [640, 1280, 2160]) {
  await sharp(join(root, "public", "bg-hero-carousel.jpg"))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 65 })
    .toFile(join(output, `hero-background-${width}.webp`));
}
