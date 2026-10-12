import { z } from "zod";

export const listingCategories: Record<string,string> = {
  "Product key":"game-keys", "Gift card":"gift-cards", "Game currency":"game-currency",
  "Game account":"game-accounts", "Game item":"game-items", "Software license":"software", "Power leveling":"power-leveling",
};

export function normalizeListingCurrency(value: string) {
  const code = ({"$":"USD","€":"EUR","£":"GBP","¥":"JPY"} as Record<string,string>)[value.trim()] ?? value.trim().toUpperCase();
  if (!["USD","EUR","GBP","JPY"].includes(code)) throw new Error("Currency must be USD, EUR, GBP or JPY.");
  return code;
}

export const sellerListingSchema = z.object({
  title:z.string().trim().min(1,"Product name is required.").max(200),
  productType:z.string().refine(value=>value in listingCategories || Object.values(listingCategories).includes(value),"Choose a valid product type."),
  platform:z.string().trim().min(1).max(100), edition:z.string().trim().min(1).max(100),
  activationRegion:z.string().trim().min(1).max(100), delivery:z.enum(["Instant","Up to 15 min","Up to 1 hour","Manual"]),
  stock:z.number().int().min(0).max(2147483647),
  price:z.number().positive().max(9999999999.99).refine(value=>Math.abs(value*100-Math.round(value*100))<0.00001,"Price can have at most two decimal places."),
  currency:z.string().transform(normalizeListingCurrency),
  imageUrl:z.string().refine(value=>!value.startsWith("data:") && (value.startsWith("/") && !value.startsWith("//") || /^https:\/\//.test(value)),"Upload an image or choose a valid image URL."),
  description:z.string().trim().max(20000), status:z.enum(["draft","published","paused"]),
});
