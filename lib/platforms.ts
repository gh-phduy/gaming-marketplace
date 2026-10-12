import platforms from "./constants/platforms.json";

export const CATALOG_PLATFORMS = platforms;
// The existing database column is text. Comma-separated tags remain compatible
// with single-platform listings; never split '/' in Xbox Series X/S.
export function getProductPlatforms(
  value: string | string[] | null | undefined,
): string[] {
  const tags = (Array.isArray(value) ? value : [value ?? ""])
    .flatMap((tag) => tag.split(/[,;|]/))
    .map((tag) => tag.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const id = normalizePlatformId(tag);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
const aliases: Record<string, string> = {
  "playstation-5": "ps5",
  playstation5: "ps5",
  "ps-5": "ps5",
  "playstation-4": "ps4",
  playstation4: "ps4",
  "ps-4": "ps4",
  "xbox-series-x-s": "xbox-series-x",
  "xbox-series": "xbox-series-x",
  "xbox-live": "xbox",
  "playstation-store": "playstation",
  "nintendo-eshop": "nintendo",
};
export function normalizePlatformId(value: string) {
  const id = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return aliases[id] ?? id;
}
export function getPlatformFamily(value: string) {
  const id = normalizePlatformId(value);
  const platform = platforms.find((platform) => platform.id === id);
  if (platform) return platform.family;
  if (
    [
      "pc",
      "steam",
      "gog",
      "gog-com",
      "epic",
      "epic-games",
      "ea",
      "ubisoft",
      "windows-store",
      "microsoft",
    ].includes(id)
  )
    return "pc";
  if (id.startsWith("playstation") || /^ps[345]/.test(id)) return "playstation";
  if (id.startsWith("xbox")) return "xbox";
  if (id.startsWith("nintendo")) return "nintendo";
  return "unknown";
}
export function getPlatformLabel(value: string) {
  return (
    platforms.find((platform) => platform.id === normalizePlatformId(value))
      ?.label ?? value
  );
}
export function isCatalogPlatformFilter(value: string) {
  const id = normalizePlatformId(value);
  return (
    platforms.some((platform) => platform.id === id) ||
    ["playstation", "xbox", "nintendo"].includes(id)
  );
}
export function matchesPlatformFilter(
  platform: string | string[],
  filter: string,
) {
  const id = normalizePlatformId(filter);
  return getProductPlatforms(platform).some((tag) =>
    ["pc", "playstation", "xbox", "nintendo"].includes(id)
      ? getPlatformFamily(tag) === id
      : normalizePlatformId(tag) === id,
  );
}
